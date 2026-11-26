// Market data goes through our own cached proxy first (/api/market: a Vercel Function in
// production, the Worker in development, or the Worker at VITE_API_URL if set), so every
// visitor shares one cache instead of spending CoinGecko's tiny per-IP quota. If no backend
// answers (static hosting, or `npm run dev` without the Worker) we fall back to CoinGecko directly.
const API_URL = import.meta.env?.VITE_API_URL ?? ''
const DIRECT = 'https://api.coingecko.com/api/v3'
const KEY = import.meta.env?.VITE_COINGECKO_API_KEY
const PROXY = `${API_URL}/api/market`

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

let proxyDown = false // remember for this session once the proxy proves unavailable

const isJson = (res) => res?.headers.get('content-type')?.includes('application/json')

async function cg(path, params = {}) {
  const qs = query(params)
  let res = null
  if (!proxyDown) {
    res = await request(`${PROXY}${path}?${qs}`)
    // No backend: the request fails, the dev server answers 5xx, or static hosting serves index.html.
    if (!res || res.status >= 500 || !isJson(res)) {
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
    res = await fetch(`${API_URL}/api/news?limit=${limit}`)
  } catch {
    throw new ApiError('News unavailable', 0)
  }
  if (!res.ok) throw new ApiError('News unavailable', res.status)
  return res.json()
}

/** Is there a backend (and an AI key)? Decides at runtime whether news and the copilot are shown. */
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' })
    if (!res.ok || !isJson(res)) return { ok: false, copilot: false }
    return await res.json()
  } catch {
    return { ok: false, copilot: false }
  }
}
