import { ALLOWED_MARKET_PATHS, marketTtl, upstreamHeaders } from '../worker/src/marketProxy.js'
import { json, originAllowed } from './_lib/http.js'

const UPSTREAM = 'https://api.coingecko.com/api/v3'

/**
 * Allowlisted, CDN-cached proxy in front of CoinGecko. vercel.json rewrites
 * /api/market/<path> → /api/market?path=<path>. Every visitor shares Vercel's
 * cached copy, so the app doesn't burn through CoinGecko's per-IP rate limit.
 */
export async function GET(request) {
  if (!originAllowed(request)) return json({ error: 'Origin not allowed' }, 403)
  const url = new URL(request.url)
  const path = '/' + (url.searchParams.get('path') ?? '').replace(/^\/+/, '')
  if (!ALLOWED_MARKET_PATHS.some((re) => re.test(path))) return json({ error: 'Not allowed' }, 404)

  const upstream = new URL(UPSTREAM + path)
  for (const [k, v] of url.searchParams) if (k !== 'path') upstream.searchParams.set(k, v)

  const res = await fetch(upstream, { headers: upstreamHeaders(process.env) })
  if (!res.ok) return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  const ttl = marketTtl(path)
  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 5}`,
    },
  })
}
