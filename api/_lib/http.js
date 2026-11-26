// Shared helpers for the Vercel Functions in /api (files under _lib are not routes).

export const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

/**
 * The site and its API share one origin on Vercel. Browsers send `Origin` on POSTs
 * (and on cross-site requests), so: no Origin → same-origin GET; Origin must match
 * this deployment, or be listed in ALLOWED_ORIGINS (comma-separated, optional).
 * This works on preview deployments too, since each one checks its own origin.
 */
export function originAllowed(request) {
  const origin = request.headers.get('origin')
  if (!origin) return request.method === 'GET' || request.method === 'HEAD'
  if (origin === new URL(request.url).origin) return true
  const extra = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return extra.includes(origin)
}

/**
 * Best-effort per-IP limiter. Vercel's Fluid compute reuses warm instances, so this
 * catches bursts from one client; it is not a global limit (that needs a shared store
 * such as Upstash, or a Vercel Firewall rate-limit rule).
 */
const hits = new Map()
export function rateLimited(request, { limit = 10, windowMs = 60_000 } = {}) {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // keep memory bounded
  return recent.length > limit
}
