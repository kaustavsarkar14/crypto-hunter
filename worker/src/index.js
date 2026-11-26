import { SSE_HEADERS, isCopilotConfigured, parseChatRequest, pickProvider, startChatStream } from './chat.js'
import { proxyMarket } from './marketProxy.js'
import { getHeadlines } from './news.js'

export { pickProvider } from './chat.js'

const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/

export function isAllowedOrigin(origin, env) {
  if (!origin) return false
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim())
  if (allowed.includes(origin)) return true
  // Local development only (set in .dev.vars, never in production): any localhost port,
  // because Vite hops to 5174, 5175… when 5173 is busy.
  return env.DEV_ALLOW_LOCALHOST === 'true' && LOCALHOST.test(origin)
}

/**
 * Browsers omit Origin on same-origin GETs (e.g. through the Vite dev proxy), so public
 * read-only data is served without one. Cross-site browser requests must still come
 * from an allowed origin, and the copilot (which spends API quota) always requires one.
 */
export function checkAccess(request, env, { publicRead = false } = {}) {
  const origin = request.headers.get('Origin')
  if (!origin && publicRead && ['GET', 'HEAD'].includes(request.method)) return { ok: true, cors: {} }
  const cors = corsHeaders(request, env)
  return cors ? { ok: true, cors } : { ok: false }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin')
  if (!isAllowedOrigin(origin, env)) return null
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

const json = (body, status, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const isChat = url.pathname === '/api/chat'
    const isMarket = url.pathname.startsWith('/api/market/')
    const isNews = url.pathname === '/api/news'
    const isHealth = url.pathname === '/api/health'
    if (!isChat && !isMarket && !isNews && !isHealth) return json({ error: 'Not found' }, 404)
    const access = checkAccess(request, env, { publicRead: isMarket || isNews || isHealth })
    if (!access.ok) return json({ error: 'Origin not allowed' }, 403)
    const cors = access.cors
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (isMarket) return proxyMarket(request, env, ctx, cors)
    if (isNews) return newsResponse(request, ctx, cors)
    if (isHealth) return json({ ok: true, copilot: isCopilotConfigured(env) }, 200, { ...cors, 'Cache-Control': 'no-store' })
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors)
    const provider = pickProvider(env)
    if (!env[provider.keyName]) return json({ error: `Copilot is not configured yet (missing ${provider.keyName}).` }, 503, cors)

    if (env.CHAT_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'anon'
      const { success } = await env.CHAT_LIMITER.limit({ key: ip })
      if (!success) return json({ error: 'Too many requests. Try again in a minute.' }, 429, cors)
    }

    const messages = await parseChatRequest(request)
    if (!messages) return json({ error: 'Invalid request' }, 400, cors)

    const body = startChatStream({ provider, env, messages, signal: request.signal, waitUntil: (p) => ctx.waitUntil(p) })
    return new Response(body, { headers: { ...cors, ...SSE_HEADERS } })
  },
}

const NEWS_TTL = 300

/** Aggregated headlines, edge-cached for 5 minutes so the feeds are hit at most once per 5 min per PoP. */
async function newsResponse(request, ctx, cors) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors)
  const limit = Math.min(20, Math.max(1, Number(new URL(request.url).searchParams.get('limit')) || 12))
  const cacheKey = new Request(`https://cache.crypto-hunter.internal/news?limit=${limit}`)
  const cache = caches.default
  let res = await cache.match(cacheKey)
  if (!res) {
    const articles = await getHeadlines(limit)
    if (!articles.length) return json({ error: 'News feeds unavailable' }, 502, cors)
    res = new Response(JSON.stringify({ articles, updatedAt: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${NEWS_TTL}` },
    })
    ctx.waitUntil(cache.put(cacheKey, res.clone()))
  }
  const out = new Response(res.body, res)
  for (const [k, v] of Object.entries(cors)) out.headers.set(k, v)
  return out
}
