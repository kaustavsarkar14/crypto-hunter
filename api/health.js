import { isCopilotConfigured } from '../worker/src/chat.js'
import { json } from './_lib/http.js'

/** Lets the UI discover at runtime whether the backend (and an AI key) is available. */
export function GET() {
  return json({ ok: true, copilot: isCopilotConfigured(process.env) })
}
