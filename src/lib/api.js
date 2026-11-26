// Where market data comes from:
// - VITE_API_URL set (production): the Worker's edge-cached proxy, shared by every visitor.
// - Development: the same proxy through Vite (/api → `wrangler dev`), so reloads share one
//   cache instead of each spending CoinGecko's tiny per-IP quota. If the Worker isn't
//   running, fall back to CoinGecko directly so the app still works.
const API_URL = import.meta.env?.VITE_API_URL
const DIRECT = 'https://api.coingecko.com/api/v3'
const KEY = import.meta.env?.VITE_COINGECKO_API_KEY
const PROXY = API_URL ? `${API_URL}/api/market` : import.meta.env?.DEV ? '/api/market' : null

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const query = (params) => {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v != null) q.set(k, String(v))
  return q.toString()
}

async function request(url, headers) {
  try {
    return await fetch(url, headers ? { headers } : undefined)
  } catch {
    return null // network failure (or CORS-less error response from CoinGecko)
  }
}

let proxyDown = false // remember for this session once the dev proxy proves unreachable

async function cg(path, params = {}) {
  const qs = query(params)
  let res = null
  if (PROXY && !proxyDown) {
    res = await request(`${PROXY}${path}?${qs}`)
    // Worker not running in dev: Vite answers 5xx (or the request fails). Use CoinGecko directly.
    if (!API_URL && (!res || res.status >= 500)) {
      proxyDown = true
      res = null
    }
  }
  res ??= await request(`${DIRECT}${path}?${qs}`, KEY ? { 'x-cg-demo-api-key': KEY } : undefined)
  if (!res) throw new ApiError('Market data is busy or unreachable. Retrying…', 0)
  if (!res.ok) {
    const message =
      res.status === 429
        ? 'CoinGecko rate limit reached. Retrying shortly…'
        : res.status === 404
          ? 'Not found'
          : `Market data error (${res.status})`
    throw new ApiError(message, res.status)
  }
  return res.json()
}

const vs = (currency) => currency.toLowerCase()

export const fetchMarkets = (currency) =>
  cg('/coins/markets', {
    vs_currency: vs(currency),
    order: 'market_cap_desc',
    per_page: 250,
    page: 1,
    sparkline: true,
    price_change_percentage: '1h,24h,7d',
  })

export const fetchCoin = (id) =>
  cg(`/coins/${encodeURIComponent(id)}`, {
    localization: false,
    tickers: false,
    community_data: false,
    developer_data: false,
    sparkline: false,
  })

export const fetchMarketChart = (id, currency, days) =>
  cg(`/coins/${encodeURIComponent(id)}/market_chart`, { vs_currency: vs(currency), days })

export const fetchOhlc = (id, currency, days) =>
  cg(`/coins/${encodeURIComponent(id)}/ohlc`, { vs_currency: vs(currency), days })

/** Price of 1 USDT in each supported fiat — converts Binance USDT ticks into the user's currency. */
export const fetchFx = () => cg('/simple/price', { ids: 'tether', vs_currencies: 'usd,inr,eur,gbp' })

export const fetchGlobal = () => cg('/global')

/** Aggregated headlines from the Worker (edge-cached 5 min). In dev, Vite proxies /api to the Worker. */
export async function fetchNews(limit = 12) {
  let res
  try {
    res = await fetch(`${API_URL ?? ''}/api/news?limit=${limit}`)
  } catch {
    throw new ApiError('News unavailable', 0)
  }
  if (!res.ok) throw new ApiError('News unavailable', res.status)
  return res.json()
}
