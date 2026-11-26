import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as chat } from '../api/chat.js'
import { GET as health } from '../api/health.js'
import { GET as market } from '../api/market.js'

const SITE = 'https://crypto-hunter.vercel.app'
const req = (path, { method = 'GET', origin, body, ip = '1.1.1.1' } = {}) =>
  new Request(SITE + path, {
    method,
    headers: { ...(origin ? { origin } : {}), 'content-type': 'application/json', 'x-real-ip': ip },
    body: body ? JSON.stringify(body) : undefined,
  })

const saved = { ...process.env }
beforeEach(() => {
  delete process.env.GROQ_API_KEY
  delete process.env.ANTHROPIC_API_KEY
  delete process.env.LLM_PROVIDER
})
afterEach(() => {
  process.env = { ...saved }
  vi.restoreAllMocks()
})

describe('/api/health', () => {
  it('reports whether the copilot has a key', async () => {
    expect(await (await health()).json()).toEqual({ ok: true, copilot: false })
    process.env.GROQ_API_KEY = 'gsk_test'
    expect(await (await health()).json()).toEqual({ ok: true, copilot: true })
  })
})

describe('/api/market', () => {
  it('only proxies allowlisted CoinGecko paths', async () => {
    expect((await market(req('/api/market?path=coins/bitcoin/tickers'))).status).toBe(404)
    expect((await market(req('/api/market?path=../../etc'))).status).toBe(404)
  })

  it('blocks other websites', async () => {
    expect((await market(req('/api/market?path=global', { origin: 'https://evil.com' }))).status).toBe(403)
  })

  it('forwards query params and sets a shared CDN cache header', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ ok: 1 }))
    const res = await market(req('/api/market?path=coins/markets&vs_currency=usd&per_page=250'))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toMatch(/s-maxage=60/)
    const upstream = new URL(spy.mock.calls[0][0])
    expect(upstream.pathname).toBe('/api/v3/coins/markets')
    expect(upstream.searchParams.get('vs_currency')).toBe('usd')
    expect(upstream.searchParams.has('path')).toBe(false)
  })

  it('passes rate-limit errors through without caching them', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 429 }))
    const res = await market(req('/api/market?path=global'))
    expect(res.status).toBe(429)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})

describe('/api/chat', () => {
  const body = { messages: [{ role: 'user', content: 'hi' }] }

  it('requires a same-site Origin (blocks scripts and other websites)', async () => {
    process.env.GROQ_API_KEY = 'k'
    expect((await chat(req('/api/chat', { method: 'POST', body }))).status).toBe(403)
    expect((await chat(req('/api/chat', { method: 'POST', body, origin: 'https://evil.com' }))).status).toBe(403)
  })

  it('explains a missing key, and rejects malformed bodies', async () => {
    expect((await chat(req('/api/chat', { method: 'POST', body, origin: SITE }))).status).toBe(503)
    process.env.GROQ_API_KEY = 'k'
    expect((await chat(req('/api/chat', { method: 'POST', body: { messages: [] }, origin: SITE }))).status).toBe(400)
  })

  it('rate-limits bursts from one IP', async () => {
    process.env.GROQ_API_KEY = 'k'
    const bad = { messages: [] } // fails validation after the limiter, so no model calls are made
    const statuses = []
    for (let i = 0; i < 12; i++) statuses.push((await chat(req('/api/chat', { method: 'POST', body: bad, origin: SITE, ip: '9.9.9.9' }))).status)
    expect(statuses.slice(0, 10).every((s) => s === 400)).toBe(true)
    expect(statuses.at(-1)).toBe(429)
  })
})
