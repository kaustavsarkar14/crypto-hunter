import { z } from 'zod'
import { claude } from './providers/claude.js'
import { groq } from './providers/groq.js'

/**
 * Platform-neutral copilot core, shared by the Cloudflare Worker (index.js)
 * and the Vercel Functions (/api/chat.js). Standard Request/Response/streams only.
 */
const PROVIDERS = { claude, groq }

/** LLM_PROVIDER picks the model backend; otherwise use whichever key is configured (Claude first). */
export function pickProvider(env) {
  if (env.LLM_PROVIDER && PROVIDERS[env.LLM_PROVIDER]) return PROVIDERS[env.LLM_PROVIDER]
  return env.ANTHROPIC_API_KEY ? claude : groq
}

export const isCopilotConfigured = (env) => Boolean(env[pickProvider(env).keyName])

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(20)
    .refine((m) => m[0].role === 'user' && m.at(-1).role === 'user', 'conversation must start and end with a user message'),
  context: z.record(z.string(), z.unknown()).optional(),
})

/** Validate the request body; app context rides along with the latest user message as delimited data. */
export async function parseChatRequest(request) {
  let body
  try {
    body = Body.parse(await request.json())
  } catch {
    return null
  }
  const messages = body.messages.map((m) => ({ role: m.role, content: m.content }))
  if (body.context) {
    const last = messages.at(-1)
    last.content = `<app_context>${JSON.stringify(body.context).slice(0, 4000)}</app_context>\n\n${last.content}`
  }
  return messages
}

export const SSE_HEADERS = { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform' }

/**
 * Start the agent and return an SSE body that streams its events.
 * `waitUntil` (Cloudflare) keeps the run alive; on Vercel the open stream does.
 */
export function startChatStream({ provider, env, messages, signal, waitUntil }) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()
  const emit = (event, data) =>
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)).catch(() => {})

  emit('meta', { model: provider.label })
  const run = provider
    .run({ env, messages, emit, signal })
    .catch((err) => {
      console.error(err)
      emit('error', { message: provider.publicMessage(err) ?? 'Something went wrong. Please try again.' })
    })
    .finally(() => writer.close().catch(() => {}))
  waitUntil?.(run)
  return readable
}
