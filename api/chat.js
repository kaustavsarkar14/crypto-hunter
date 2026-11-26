import { SSE_HEADERS, parseChatRequest, pickProvider, startChatStream } from '../worker/src/chat.js'
import { json, originAllowed, rateLimited } from './_lib/http.js'

/** AI copilot: streams the tool-use loop as Server-Sent Events. Same core as the Cloudflare Worker. */
export async function POST(request) {
  if (!originAllowed(request) || !request.headers.get('origin')) return json({ error: 'Origin not allowed' }, 403)
  const env = process.env
  const provider = pickProvider(env)
  if (!env[provider.keyName]) return json({ error: `Copilot is not configured yet (missing ${provider.keyName}).` }, 503)
  if (rateLimited(request)) return json({ error: 'Too many requests. Try again in a minute.' }, 429)

  const messages = await parseChatRequest(request)
  if (!messages) return json({ error: 'Invalid request' }, 400)

  // The open response stream keeps this invocation alive until the agent finishes.
  const body = startChatStream({ provider, env, messages, signal: request.signal })
  return new Response(body, { headers: SSE_HEADERS })
}
