import Anthropic from '@anthropic-ai/sdk'
import { systemPrompt } from '../prompt.js'
import { CLAUDE_TOOLS, ToolError, runTool } from '../tools.js'

const MODEL = 'claude-opus-5-5'
const MAX_TURNS = 8
const SYSTEM = systemPrompt({ webSearch: true })

export const claude = {
  id: 'claude',
  label: 'Claude Opus 5.5',
  keyName: 'ANTHROPIC_API_KEY',

  publicMessage(err) {
    if (err instanceof Anthropic.RateLimitError) return 'The copilot is busy right now. Please try again shortly.'
    if (err instanceof Anthropic.AuthenticationError) return 'Copilot API key is invalid.'
    if (err instanceof Anthropic.APIError) return 'The copilot hit an upstream error. Please try again.'
    return null
  },

  /** Streaming manual tool-use loop: text deltas go straight to the browser as SSE. */
  async run({ env, messages, emit, signal }) {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    const conversation = [...messages]
    let parseRetries = 0

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      emit('turn', { n: turn })
      const stream = client.beta.messages.stream(
        {
          model: MODEL,
          max_tokens: 32000,
          system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
          tools: CLAUDE_TOOLS,
          messages: conversation,
          output_config: { effort: 'medium' },
          // If a safety classifier declines, the API re-runs the request on a fallback model in the same call.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal },
      )
      stream.on('text', (delta) => emit('text', { delta }))
      stream.on('streamEvent', (event) => {
        const block = event.type === 'content_block_start' ? event.content_block : null
        if (block && (block.type === 'tool_use' || block.type === 'server_tool_use')) emit('tool', { name: block.name })
      })

      let message
      try {
        message = await stream.finalMessage()
        parseRetries = 0
      } catch (err) {
        // With eager input streaming, unparseable tool JSON rejects here.
        // Re-issue the turn; API errors and client aborts are not retried.
        if (err instanceof Anthropic.APIError || signal.aborted || parseRetries++ >= 2) throw err
        emit('retry', {})
        turn--
        continue
      }

      if (message.stop_reason === 'refusal') {
        emit('text', { delta: "\n\nI can't help with that request." })
        return emit('done', {})
      }
      if (message.stop_reason === 'pause_turn') {
        // Server-side web search hit its iteration limit; send the turn back to continue.
        conversation.push({ role: 'assistant', content: message.content })
        continue
      }

      const toolUses = message.content.filter((b) => b.type === 'tool_use')
      // A tool input cut off at max_tokens can still parse as a valid partial object — never run it.
      if (message.stop_reason === 'max_tokens' && toolUses.length) throw new Error('Tool input truncated at max_tokens')
      if (message.stop_reason !== 'tool_use' || toolUses.length === 0) return emit('done', {})

      conversation.push({ role: 'assistant', content: message.content })
      // Run tool calls in parallel and return every result in one user message.
      const results = await Promise.all(
        toolUses.map(async (tu) => {
          try {
            const out = await runTool(tu.name, tu.input, { env, emit })
            return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(out) }
          } catch (err) {
            const content = err instanceof ToolError ? err.message : 'Tool failed unexpectedly.'
            return { type: 'tool_result', tool_use_id: tu.id, is_error: true, content }
          }
        }),
      )
      conversation.push({ role: 'user', content: results })
    }

    emit('text', { delta: '\n\n_(Stopped after several tool steps. Ask a narrower question for more detail.)_' })
    emit('done', {})
  },
}
