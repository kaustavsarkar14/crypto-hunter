import { systemPrompt } from '../prompt.js'
import { createCitationRewriter } from '../citations.js'
import { OPENAI_TOOLS, ToolError, runTool } from '../tools.js'

const URL = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_TURNS = 6
// Free tier allows ~8K tokens/min and every step resends the conversation, so ask for one batched step.
const SYSTEM = `${systemPrompt({ webSearch: false })}
- Request ALL the tools you need in a single step (parallel tool calls), then answer. Avoid extra rounds of tool calls.
- Every number you state (prices, levels, percentages) must come from a tool result in this conversation. For support/resistance or "key levels", call get_price_history and use its high/low and recent samples. Never invent levels.
- Never state a cause, event or announcement that isn't in a get_crypto_news result from this conversation. Whenever the user asks why something moved or what is driving it, call get_crypto_news (with the coin's name and ticker) in the same step as the data tools. If the headlines don't explain the move, say that plainly.
- Cite news as markdown links using the article url, e.g. [CoinDesk](https://www.coindesk.com/...).
- Charts you request with show_chart appear below your reply; refer to them as "the chart below" at most once.
- Do not add a financial-advice disclaimer unless the user asked whether to buy, sell or hold.`

export class ProviderError extends Error {
  constructor(status, message, retryAfter, code) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
    this.code = code
  }
}

/** Parse an OpenAI-style SSE body into JSON chunks (stops at [DONE]). */
export async function* readChunks(body) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) buf += '\n' // flush a final line that arrived without a trailing newline
    else buf += value
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return
      yield JSON.parse(data)
    }
    if (done) return
  }
}

/**
 * Consume one streamed completion: forward text, collect tool calls.
 * Tool-call fragments are merged by index (OpenAI streams `arguments` in pieces;
 * Groq usually sends them whole — both work).
 */
export async function consumeCompletion(chunks, emit, rewrite = (t) => t) {
  let text = ''
  let finish = null
  const calls = []
  for await (const chunk of chunks) {
    // Groq can report failures (e.g. tool_use_failed) inside a 200 stream — surface them, never skip.
    if (chunk.error) {
      const e = chunk.error
      throw new ProviderError(e.status_code ?? 502, `Groq stream error: ${e.message ?? 'unknown'}`, undefined, e.code ?? e.type)
    }
    const choice = chunk.choices?.[0]
    if (!choice) continue
    const d = choice.delta ?? {}
    // gpt-oss also streams `reasoning` on a separate channel — deliberately not shown.
    if (d.content) {
      text += d.content
      const out = rewrite(d.content)
      if (out) emit('text', { delta: out })
    }
    for (const tc of d.tool_calls ?? []) {
      const slot = (calls[tc.index ?? 0] ??= { id: '', name: '', arguments: '' })
      if (tc.id) slot.id = tc.id
      if (tc.function?.name && !slot.name) {
        slot.name = tc.function.name
        emit('tool', { name: slot.name })
      }
      if (tc.function?.arguments) slot.arguments += tc.function.arguments
    }
    if (choice.finish_reason) finish = choice.finish_reason
  }
  return { text, finish, calls: calls.filter(Boolean) }
}

async function complete(env, messages, signal, emit, attempt = 0) {
  const res = await fetch(URL, {
    method: 'POST',
    signal,
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: 'auto',
      stream: true,
      reasoning_effort: 'low', // reasoning tokens count toward the per-minute budget
      parallel_tool_calls: true,
      max_completion_tokens: 2048,
    }),
  })
  if (res.ok) return res
  const retryAfter = Number(res.headers.get('retry-after'))
  // Free tier is tight (≈8K tokens/min): wait out a short rate-limit window once, and tell the UI.
  if (res.status === 429 && attempt === 0 && retryAfter > 0 && retryAfter <= 20) {
    emit('tool', { name: 'rate_limit_wait' })
    await new Promise((r) => setTimeout(r, (retryAfter + 0.5) * 1000))
    return complete(env, messages, signal, emit, 1)
  }
  const detail = await res.text().catch(() => '')
  throw new ProviderError(res.status, `Groq ${res.status}: ${detail.slice(0, 300)}`, retryAfter)
}

export const groq = {
  id: 'groq',
  label: 'GPT-OSS 120B · Groq',
  keyName: 'GROQ_API_KEY',

  publicMessage(err) {
    if (!(err instanceof ProviderError)) return null
    if (err.status === 429) return "The free AI model is at its rate limit. Try again in a minute."
    if (err.status === 401) return 'Copilot API key is invalid.'
    if (err.code === 'tool_use_failed') return 'The model stumbled on a tool call. Please try again.'
    return 'The copilot hit an upstream error. Please try again.'
  },

  async run({ env, messages, emit, signal }) {
    const conversation = [{ role: 'system', content: SYSTEM }, ...messages]
    const citations = createCitationRewriter()
    let retries = 0

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      emit('turn', { n: turn })
      let result
      try {
        const res = await complete(env, conversation, signal, emit)
        result = await consumeCompletion(readChunks(res.body), emit, citations.push)
      } catch (err) {
        // Transient model hiccups (malformed tool call, stream error) are retried; rate limits and auth are not.
        const transient = err instanceof SyntaxError || (err instanceof ProviderError && (err.code === 'tool_use_failed' || err.status >= 500))
        if (!transient || signal.aborted || retries++ >= 2) throw err
        console.warn('groq: retrying turn after', err.message)
        if (err.code === 'tool_use_failed') {
          // Repeating the identical request repeats the mistake; tell the model what was wrong.
          conversation.push({
            role: 'system',
            content: `Your previous tool call was rejected: ${err.message.slice(0, 300)}. Call the tool again with corrected arguments.`,
          })
        }
        emit('retry', {})
        turn--
        continue
      }
      const { text, finish, calls } = result
      const tail = citations.flush()
      if (tail) emit('text', { delta: tail })

      if (!calls.length) {
        if (text.trim()) return emit('done', {})
        // Occasionally the model ends a turn with nothing visible (all reasoning). Ask again.
        if (retries++ < 2) {
          console.warn('groq: empty turn (finish=%s), retrying', finish)
          turn--
          continue
        }
        emit('text', { delta: "Sorry, I couldn't put an answer together just now. Please try asking again." })
        return emit('done', {})
      }
      if (finish === 'length') throw new Error('Tool call truncated at max tokens')

      conversation.push({
        role: 'assistant',
        content: text || null,
        tool_calls: calls.map((c) => ({ id: c.id, type: 'function', function: { name: c.name, arguments: c.arguments } })),
      })
      const results = await Promise.all(
        calls.map(async (c) => {
          let content
          try {
            const input = c.arguments ? JSON.parse(c.arguments) : {}
            const result = await runTool(c.name, input, { env, emit })
            if (c.name === 'get_crypto_news') citations.addArticles(result.articles)
            content = JSON.stringify(result)
          } catch (err) {
            content = JSON.stringify({
              error: err instanceof ToolError ? err.message : err instanceof SyntaxError ? `INVALID_JSON: ${c.arguments}` : 'Tool failed unexpectedly.',
            })
          }
          return { role: 'tool', tool_call_id: c.id, content }
        }),
      )
      conversation.push(...results)
    }

    emit('text', { delta: '\n\n_(Stopped after several tool steps. Ask a narrower question for more detail.)_' })
    emit('done', {})
  },
}
