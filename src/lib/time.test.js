import { describe, expect, it } from 'vitest'
import { timeAgo } from './time'

describe('timeAgo', () => {
  const now = Date.parse('2026-11-26T12:00:00Z')
  it('formats relative times compactly', () => {
    expect(timeAgo('2026-11-26T11:59:30Z', now)).toBe('just now')
    // Exact narrow wording varies by ICU version ("5m ago" / "5 min. ago"); check the meaning.
    expect(timeAgo('2026-11-26T11:55:00Z', now)).toMatch(/^5\s?m(in\.?)? ago$/)
    expect(timeAgo('2026-11-26T09:00:00Z', now)).toMatch(/^3\s?h(r\.?)? ago$/)
    expect(timeAgo('2026-11-25T12:00:00Z', now)).toBe('yesterday')
  })
  it('returns empty for bad input', () => {
    expect(timeAgo('nope', now)).toBe('')
  })
})
