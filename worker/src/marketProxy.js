const UPSTREAM = 'https://api.coingecko.com/api/v3'

/** CoinGecko rejects server-side requests without a descriptive User-Agent. */
export function upstreamHeaders(env = {}) {
  return {
    'User-Agent': 'CryptoHunter/2.0 (market-data proxy)',
    Accept: 'application/json',
    ...(env.COINGECKO_API_KEY ? { 'x-cg-demo-api-key': env.COINGECKO_API_KEY } : {}),
  }
}

// Only the read-only endpoints the app uses — the proxy is not an open relay.
export const ALLOWED_MARKET_PATHS = [
  /^\/coins\/markets$/,
  /^\/coins\/[a-z0-9-]{1,80}$/,
  /^\/coins\/[a-z0-9-]{1,80}\/(market_chart|ohlc)$/,
  /^\/simple\/price$/,
  /^\/global$/,
  /^\/search$/,
]

const TTL = { '/global': 300, '/simple/price': 300 }
export const marketTtl = (path) => TTL[path] ?? 60

/**
 * Shared edge cache in front of CoinGecko. Every visitor hitting the same URL
 * within the TTL is served from Cloudflare's cache, so the app scales without
 * burning through CoinGecko's per-IP rate limit.
 */
export async function proxyMarket(request, env, ctx, cors) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/market/, '')
  if (request.method !== 'GET' || !ALLOWED_MARKET_PATHS.some((re) => re.test(path))) {
    return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  const upstream = new URL(UPSTREAM + path)
  upstream.search = url.search
  const cacheKey = new Request(upstream.toString())
  const cache = caches.default

  let res = await cache.match(cacheKey)
  if (!res) {
    const fresh = await fetch(upstream, { headers: upstreamHeaders(env) })
    if (!fresh.ok) {
      return new Response(fresh.body, { status: fresh.status, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const ttl = marketTtl(path)
    res = new Response(fresh.body, fresh)
    res.headers.set('Cache-Control', `public, max-age=${ttl}`)
    ctx.waitUntil(cache.put(cacheKey, res.clone()))
  }

  const out = new Response(res.body, res)
  for (const [k, v] of Object.entries(cors)) out.headers.set(k, v)
  return out
}
