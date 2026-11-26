// With VITE_API_URL set, market data goes through the Worker's edge-cached proxy
// (shared cache across all users); otherwise straight to CoinGecko's public API.
const API_URL = import.meta.env?.VITE_API_URL
const BASE = API_URL ? `${API_URL}/api/market` : 'https://api.coingecko.com/api/v3'
const KEY = API_URL ? undefined : import.meta.env?.VITE_COINGECKO_API_KEY

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function cg(path, params = {}) {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, String(v))
  let res
  try {
    res = await fetch(url, { headers: KEY ? { 'x-cg-demo-api-key': KEY } : undefined })
  } catch {
    throw new ApiError('Network error. Check your connection.', 0)
  }
  if (!res.ok) {
    const message =
      res.status === 429
        ? 'CoinGecko rate limit reached. Retrying shortly…'
        : res.status === 404
          ? 'Not found'
          : `CoinGecko error (${res.status})`
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
