import { describe, expect, it, vi } from 'vitest'
import { checkAccess, isAllowedOrigin, pickProvider } from './index.js'
import { extractImage, filterNews, latestMixed, parseRss } from './news.js'
import { ProviderError, consumeCompletion, groq, readChunks } from './providers/groq.js'
import { OPENAI_TOOLS } from './tools.js'

const sse = (...chunks) =>
  new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n').body

describe('pickProvider', () => {
  it('honours LLM_PROVIDER, else prefers Claude when its key exists', () => {
    expect(pickProvider({ LLM_PROVIDER: 'groq', ANTHROPIC_API_KEY: 'x' }).id).toBe('groq')
    expect(pickProvider({ ANTHROPIC_API_KEY: 'x' }).id).toBe('claude')
    expect(pickProvider({ GROQ_API_KEY: 'x' }).id).toBe('groq')
  })
})

describe('Groq stream handling', () => {
  it('streams text, hides reasoning, and merges fragmented tool-call arguments', async () => {
    const emit = vi.fn()
    const out = await consumeCompletion(
      readChunks(
        sse(
          { choices: [{ delta: { reasoning: 'secret thoughts' } }] },
          { choices: [{ delta: { content: 'Checking' } }] },
          { choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'get_coin', arguments: '{"coin_id":' } }] } }] },
          { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"bitcoin","currency":"usd"}' } }] } }] },
          { choices: [{ delta: {}, finish_reason: 'tool_calls' }] },
        ),
      ),
      emit,
    )
    expect(out.text).toBe('Checking')
    expect(out.finish).toBe('tool_calls')
    expect(JSON.parse(out.calls[0].arguments)).toEqual({ coin_id: 'bitcoin', currency: 'usd' })
    expect(emit).toHaveBeenCalledWith('tool', { name: 'get_coin' })
    expect(emit.mock.calls.flat().some((a) => JSON.stringify(a).includes('secret'))).toBe(false)
  })

  it('exposes every tool in OpenAI function format', () => {
    expect(OPENAI_TOOLS.map((t) => t.function.name)).toContain('get_crypto_news')
    expect(OPENAI_TOOLS.every((t) => t.type === 'function' && t.function.parameters.type === 'object')).toBe(true)
  })
})

describe('news', () => {
  const xml = `<rss><channel>
    <item><title><![CDATA[Solana ETF &amp; flows]]></title><link>https://x.com/a</link><pubDate>Wed, 25 Nov 2026 10:00:00 +0000</pubDate><description><![CDATA[<p>SOL jumps</p>]]></description></item>
    <item><title>Bitcoin miners</title><link>https://x.com/b</link><pubDate>not a date</pubDate><description>BTC</description></item>
    <item><title>No link</title><link>javascript:alert(1)</link></item>
  </channel></rss>`

  it('parses CDATA/entities, tolerates bad dates, drops non-http links', () => {
    const items = parseRss(xml, 'Test')
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ title: 'Solana ETF & flows', summary: 'SOL jumps', source: 'Test' })
    expect(items[1].published).toBeNull()
  })

  it('filters by whole-word keywords and falls back to latest when nothing matches', () => {
    const items = parseRss(xml, 'Test')
    expect(filterNews(items, 'sol', 5).items.map((i) => i.url)).toEqual(['https://x.com/a'])
    const miss = filterNews(items, 'dogecoin', 5)
    expect(miss.matched).toBe(false)
    expect(miss.items).toHaveLength(2)
  })
})

describe('isAllowedOrigin', () => {
  const prod = { ALLOWED_ORIGINS: 'https://app.example.com' }
  const dev = { ...prod, DEV_ALLOW_LOCALHOST: 'true' }

  it('allows listed origins only in production', () => {
    expect(isAllowedOrigin('https://app.example.com', prod)).toBe(true)
    expect(isAllowedOrigin('http://localhost:5174', prod)).toBe(false)
    expect(isAllowedOrigin(null, prod)).toBe(false)
  })

  it('allows any localhost port in local dev, but nothing that merely looks like it', () => {
    expect(isAllowedOrigin('http://localhost:5174', dev)).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:3000', dev)).toBe(true)
    expect(isAllowedOrigin('http://localhost.evil.com', dev)).toBe(false)
    expect(isAllowedOrigin('https://evil.com', dev)).toBe(false)
  })
})

describe('Groq resilience', () => {
  it('reads a final chunk that has no trailing newline', async () => {
    const body = new Response('data: {"choices":[{"delta":{"content":"hi"},"finish_reason":"stop"}]}').body
    const out = await consumeCompletion(readChunks(body), () => {})
    expect(out.text).toBe('hi')
  })

  it('surfaces in-stream errors instead of silently returning nothing', async () => {
    const body = sse({ error: { message: 'Failed to call a function', code: 'tool_use_failed' } })
    await expect(consumeCompletion(readChunks(body), () => {})).rejects.toBeInstanceOf(ProviderError)
  })

  it('retries an empty turn, then answers', async () => {
    const replies = [
      sse({ choices: [{ delta: { reasoning: 'hmm' }, finish_reason: 'stop' }] }),
      sse({ choices: [{ delta: { content: 'Markets are up.' }, finish_reason: 'stop' }] }),
    ]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(replies.shift()))
    const events = []
    await groq.run({ env: { GROQ_API_KEY: 'k' }, messages: [{ role: 'user', content: 'why?' }], emit: (e, d) => events.push([e, d]), signal: new AbortController().signal })
    fetchMock.mockRestore()
    const text = events.filter(([e]) => e === 'text').map(([, d]) => d.delta).join('')
    expect(text).toBe('Markets are up.')
    expect(events.at(-1)[0]).toBe('done')
  })
})

describe('news images & mixing', () => {
  it('finds cover images in the common RSS spots, https only', () => {
    expect(extractImage('<media:content url="https://cdn.x/a.jpg?w=1&amp;h=2" medium="image"/>')).toBe('https://cdn.x/a.jpg?w=1&h=2')
    expect(extractImage('<media:thumbnail url="https://cdn.x/t.jpg"/>')).toBe('https://cdn.x/t.jpg')
    expect(extractImage('<enclosure url="https://cdn.x/e.jpg" length="1" type="image/jpeg"/>')).toBe('https://cdn.x/e.jpg')
    expect(extractImage('<description><![CDATA[<img src="https://cdn.x/i.jpg">]]></description>')).toBe('https://cdn.x/i.jpg')
    expect(extractImage('<media:content url="http://insecure/x.jpg"/>')).toBeNull()
    expect(extractImage('<media:content url="javascript:alert(1)"/>')).toBeNull()
  })

  it('keeps newest first while capping each outlet', () => {
    const mk = (source, h) => ({ source, title: source + h, published: `2026-11-26T${String(h).padStart(2, '0')}:00:00Z` })
    const items = [mk('A', 9), mk('A', 8), mk('A', 7), mk('B', 6), mk('A', 5)]
    expect(latestMixed(items, 4, 2).map((i) => i.title)).toEqual(['A9', 'A8', 'B6'])
  })
})

describe('checkAccess', () => {
  const env = { ALLOWED_ORIGINS: 'https://app.example.com' }
  const req = (method, origin) => new Request('https://w.dev/api/x', { method, headers: origin ? { Origin: origin } : {} })

  it('serves public GETs without an Origin (same-origin / dev proxy)', () => {
    expect(checkAccess(req('GET'), env, { publicRead: true }).ok).toBe(true)
  })
  it('still blocks foreign sites on public endpoints', () => {
    expect(checkAccess(req('GET', 'https://evil.com'), env, { publicRead: true }).ok).toBe(false)
  })
  it('always requires an allowed Origin for the copilot', () => {
    expect(checkAccess(req('POST'), env).ok).toBe(false)
    expect(checkAccess(req('POST', 'https://app.example.com'), env).ok).toBe(true)
  })
})
