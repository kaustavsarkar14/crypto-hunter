import { describe, expect, it, vi } from 'vitest'
import { CLAUDE_TOOLS, CLIENT_TOOLS, ToolError, runTool } from './tools.js'

describe('runTool validation', () => {
  it('rejects coin ids that could escape the URL path', async () => {
    await expect(runTool('get_coin', { coin_id: '../admin', currency: 'usd' }, {})).rejects.toBeInstanceOf(ToolError)
  })

  it('rejects out-of-range values', async () => {
    await expect(runTool('get_price_history', { coin_id: 'bitcoin', currency: 'usd', days: 9999 }, {})).rejects.toThrow(/INVALID_INPUT/)
  })

  it('rejects unknown tools', async () => {
    await expect(runTool('rm_rf', {}, {})).rejects.toThrow(/Unknown tool/)
  })

  it('show_chart streams a chart event to the client', async () => {
    const emit = vi.fn()
    await runTool('show_chart', { coin_ids: ['bitcoin', 'ethereum'], days: 30 }, { emit })
    expect(emit).toHaveBeenCalledWith('chart', { coinIds: ['bitcoin', 'ethereum'], days: 30 })
  })
})

describe('tool definitions', () => {
  it('are strict-shaped', () => {
    for (const t of CLIENT_TOOLS) expect(t.input_schema.additionalProperties).toBe(false)
  })

  it('stream inputs eagerly on Claude only (server tools excluded)', () => {
    const client = CLAUDE_TOOLS.filter((t) => !t.type)
    expect(client.every((t) => t.eager_input_streaming === true)).toBe(true)
    expect(CLAUDE_TOOLS.find((t) => t.name === 'web_search').eager_input_streaming).toBeUndefined()
  })
})
