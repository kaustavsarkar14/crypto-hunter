import { z } from 'zod'
import { upstreamHeaders } from './marketProxy.js'
import { getNews } from './news.js'

const CG = 'https://api.coingecko.com/api/v3'

// Model output is untrusted: coin ids are interpolated into URLs, so pin them to CoinGecko's id charset.
const coinId = z.string().regex(/^[a-z0-9-]{1,80}$/, 'coin_id must be a CoinGecko id like "bitcoin"')
// Models often echo the app's "USD"; accept any case and normalise before validating.
const currency = z.preprocess((v) => (typeof v === 'string' ? v.toLowerCase() : v), z.enum(['usd', 'inr', 'eur', 'gbp'])).default('usd')

const schemas = {
  search_coins: z.object({ query: z.string().min(1).max(60) }),
  get_market_overview: z.object({ currency, limit: z.number().int().min(1).max(50).default(15) }),
  get_coin: z.object({ coin_id: coinId, currency }),
  get_price_history: z.object({ coin_id: coinId, currency, days: z.number().int().min(1).max(365) }),
  show_chart: z.object({ coin_ids: z.array(coinId).min(1).max(3), days: z.number().int().min(1).max(365) }),
  get_crypto_news: z.object({ query: z.string().max(60).optional(), limit: z.number().int().min(1).max(10).default(6) }),
}

// No JSON-schema enum here: Groq validates server-side and hard-fails the whole turn on "USD" vs "usd".
// zod (above) still enforces the allowed values after lower-casing.
const currencyProp = { type: 'string', description: 'Quote currency code: usd, inr, eur or gbp. Use the user\'s currency from app_context.' }
const coinIdProp = { type: 'string', description: 'CoinGecko coin id, e.g. "bitcoin", "ethereum", "solana". Use search_coins if unsure.' }

/** Client tools. Order is fixed so the tools prefix stays prompt-cache friendly. */
export const CLIENT_TOOLS = [
  {
    name: 'search_coins',
    description: 'Find CoinGecko coin ids by name or ticker. Use when the user names a coin and you are not certain of its id.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false },
  },
  {
    name: 'get_market_overview',
    description: 'Global market stats (total cap, BTC dominance, 24h change) plus the top coins by market cap with price and 1h/24h/7d change.',
    input_schema: {
      type: 'object',
      properties: { currency: currencyProp, limit: { type: 'integer', minimum: 1, maximum: 50 } },
      required: ['currency'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_coin',
    description: 'Current fundamentals for one coin: price, % change over 1h/24h/7d/30d/1y, market cap, rank, volume, supply, ATH and a short description.',
    input_schema: { type: 'object', properties: { coin_id: coinIdProp, currency: currencyProp }, required: ['coin_id', 'currency'], additionalProperties: false },
  },
  {
    name: 'get_price_history',
    description: 'Summarised price history over N days: start/end, % change, high/low, max drawdown, volatility and ~24 sampled points.',
    input_schema: {
      type: 'object',
      properties: { coin_id: coinIdProp, currency: currencyProp, days: { type: 'integer', minimum: 1, maximum: 365 } },
      required: ['coin_id', 'currency', 'days'],
      additionalProperties: false,
    },
  },
  {
    name: 'show_chart',
    description:
      'Render an interactive performance chart in the chat (each coin rebased to % change). Use when a visual helps — comparisons, trends, "show me". The user sees it directly; do not describe the chart pixel by pixel.',
    input_schema: {
      type: 'object',
      properties: {
        coin_ids: { type: 'array', items: coinIdProp, minItems: 1, maxItems: 3 },
        days: { type: 'integer', minimum: 1, maximum: 365 },
      },
      required: ['coin_ids', 'days'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_crypto_news',
    description:
      'Latest crypto headlines with summaries and links from CoinDesk, Cointelegraph, Decrypt and Bitcoin Magazine. Optionally filter by keywords such as a coin name or ticker ("solana sol").',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords to match, e.g. "ethereum eth etf". Omit for top headlines.' },
        limit: { type: 'integer', minimum: 1, maximum: 10 },
      },
      additionalProperties: false,
    },
  },
]

/** Anthropic format (eager input streaming on: inputs are validated with zod before running). */
export const CLAUDE_TOOLS = [
  ...CLIENT_TOOLS.map((t) => ({ ...t, eager_input_streaming: true })),
  { type: 'web_search_20260209', name: 'web_search', max_uses: 3 },
]

/** OpenAI-compatible format (Groq and friends). */
export const OPENAI_TOOLS = CLIENT_TOOLS.map((t) => ({
  type: 'function',
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}))

// Short-lived in-memory cache + in-flight de-duplication for CoinGecko calls. Works on any
// runtime (Cloudflare's `cf.cacheTtl` is ignored on Vercel/Node), and warm serverless
// instances reuse it, so repeated copilot questions don't burn the upstream rate limit.
const CACHE_TTL = 60_000
const cache = new Map() // url → { expires, promise }

async function cg(path, params, env) {
  const url = new URL(CG + path)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, String(v))
  const key = url.toString()
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.promise

  const promise = (async () => {
    const res = await fetch(url, {
      headers: upstreamHeaders(env),
      cf: { cacheTtl: 60, cacheEverything: true }, // Cloudflare edge cache (no-op elsewhere)
    })
    if (res.status === 404) throw new ToolError('Coin not found. Try search_coins to get the right id.')
    if (res.status === 429) throw new ToolError('Market data provider is rate limited. Answer with what you have or try fewer calls.')
    if (!res.ok) throw new ToolError(`Market data request failed (${res.status}).`)
    return res.json()
  })()
  cache.set(key, { expires: Date.now() + CACHE_TTL, promise })
  promise.catch(() => cache.delete(key)) // never cache failures
  if (cache.size > 300) cache.delete(cache.keys().next().value) // bounded memory
  return promise
}

export class ToolError extends Error {}

const round = (n, sig = 6) => (typeof n === 'number' && Number.isFinite(n) ? +n.toPrecision(sig) : null)
const pct = (n) => (typeof n === 'number' ? +n.toFixed(2) : null)

const handlers = {
  async search_coins({ query }, { env }) {
    const data = await cg('/search', { query }, env)
    return data.coins.slice(0, 8).map((c) => ({ id: c.id, name: c.name, symbol: c.symbol, rank: c.market_cap_rank }))
  },

  async get_market_overview({ currency, limit }, { env }) {
    const [global, coins] = await Promise.all([
      cg('/global', {}, env),
      cg('/coins/markets', { vs_currency: currency, order: 'market_cap_desc', per_page: limit, price_change_percentage: '1h,24h,7d' }, env),
    ])
    const g = global.data
    return {
      currency,
      total_market_cap: round(g.total_market_cap[currency]),
      market_cap_change_24h_pct: pct(g.market_cap_change_percentage_24h_usd),
      btc_dominance_pct: pct(g.market_cap_percentage.btc),
      eth_dominance_pct: pct(g.market_cap_percentage.eth),
      coins: coins.map((c) => ({
        id: c.id,
        symbol: c.symbol,
        rank: c.market_cap_rank,
        price: round(c.current_price),
        change_1h_pct: pct(c.price_change_percentage_1h_in_currency),
        change_24h_pct: pct(c.price_change_percentage_24h_in_currency),
        change_7d_pct: pct(c.price_change_percentage_7d_in_currency),
        market_cap: round(c.market_cap, 4),
      })),
    }
  },

  async get_coin({ coin_id, currency }, { env }) {
    const c = await cg(`/coins/${coin_id}`, { localization: false, tickers: false, community_data: false, developer_data: false }, env)
    const m = c.market_data
    return {
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      rank: c.market_cap_rank,
      categories: c.categories?.slice(0, 5),
      currency,
      price: round(m.current_price[currency]),
      change_pct: {
        '1h': pct(m.price_change_percentage_1h_in_currency?.[currency]),
        '24h': pct(m.price_change_percentage_24h),
        '7d': pct(m.price_change_percentage_7d),
        '30d': pct(m.price_change_percentage_30d),
        '1y': pct(m.price_change_percentage_1y),
      },
      market_cap: round(m.market_cap[currency], 4),
      volume_24h: round(m.total_volume[currency], 4),
      high_24h: round(m.high_24h[currency]),
      low_24h: round(m.low_24h[currency]),
      ath: round(m.ath[currency]),
      ath_date: m.ath_date?.[currency]?.slice(0, 10),
      from_ath_pct: pct(m.ath_change_percentage[currency]),
      circulating_supply: round(m.circulating_supply, 4),
      max_supply: round(m.max_supply, 4),
      description: c.description?.en?.replace(/<[^>]*>/g, '').slice(0, 240),
    }
  },

  async get_price_history({ coin_id, currency, days }, { env }) {
    const { prices } = await cg(`/coins/${coin_id}/market_chart`, { vs_currency: currency, days }, env)
    if (!prices?.length) throw new ToolError('No price history available.')
    const values = prices.map((p) => p[1])
    let peak = values[0]
    let maxDrawdown = 0
    for (const v of values) {
      peak = Math.max(peak, v)
      maxDrawdown = Math.min(maxDrawdown, (v - peak) / peak)
    }
    const returns = values.slice(1).map((v, i) => Math.log(v / values[i]))
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length
    const stdev = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length)
    const step = Math.max(1, Math.floor(prices.length / 24))
    return {
      coin_id,
      currency,
      days,
      start: round(values[0]),
      end: round(values.at(-1)),
      change_pct: pct(((values.at(-1) - values[0]) / values[0]) * 100),
      high: round(Math.max(...values)),
      low: round(Math.min(...values)),
      max_drawdown_pct: pct(maxDrawdown * 100),
      volatility_per_interval_pct: pct(stdev * 100),
      samples: prices.filter((_, i) => i % step === 0).map(([t, v]) => [new Date(t).toISOString().slice(0, 16), round(v)]),
    }
  },

  async get_crypto_news({ query, limit }, { emit }) {
    const result = await getNews({ query, limit })
    // Sources are shown by the UI deterministically, whether or not the model cites them.
    emit?.('sources', result.articles.map(({ title, url, source }) => ({ title, url, source })))
    return result
  },

  async show_chart({ coin_ids, days }, { emit }) {
    emit('chart', { coinIds: coin_ids, days })
    return { shown: true, note: 'The chart is now visible to the user.' }
  },
}

/** Validate then run. Validation matters: with eager input streaming the API no longer checks inputs for us. */
export async function runTool(name, input, ctx) {
  const schema = schemas[name]
  if (!schema) throw new ToolError(`Unknown tool ${name}`)
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ToolError(JSON.stringify({ INVALID_INPUT: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }))
  }
  return handlers[name](parsed.data, ctx)
}
