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

describe('currency handling', () => {
  it('accepts upper-case currency codes from the model and normalises them', async () => {
    const emit = vi.fn()
    // show_chart has no network call; use get_* schemas indirectly via a rejected id to prove parsing order
    await expect(runTool('get_coin', { coin_id: 'BAD ID', currency: 'USD' }, { emit })).rejects.toThrow(/coin_id/)
    await expect(runTool('get_coin', { coin_id: 'bitcoin', currency: 'JPY' }, { emit })).rejects.toThrow(/INVALID_INPUT/)
  })

  it('does not put a case-sensitive enum in the schema sent to the model', () => {
    const cur = CLIENT_TOOLS.find((t) => t.name === 'get_coin').input_schema.properties.currency
    expect(cur.enum).toBeUndefined()
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
