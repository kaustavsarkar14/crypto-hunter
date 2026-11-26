import { describe, expect, it } from 'vitest'
import { formatCompact, formatPercent, formatPrice } from './format'

describe('formatPrice', () => {
  it('adapts precision to magnitude', () => {
    expect(formatPrice(64210.551, 'USD')).toBe('$64,210.55')
    expect(formatPrice(0.48213, 'USD')).toBe('$0.4821')
    expect(formatPrice(0.0000231512, 'USD')).toBe('$0.00002315')
  })
  it('uses Indian digit grouping for INR', () => {
    expect(formatPrice(5432109.5, 'INR')).toBe('₹54,32,109.50')
  })
  it('handles missing values', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice(NaN)).toBe('—')
  })
})

describe('formatCompact / formatPercent', () => {
  it('compacts large money values', () => {
    expect(formatCompact(1_270_000_000_000, 'USD')).toBe('$1.27T')
  })
  it('signs percentages', () => {
    expect(formatPercent(2.345)).toBe('+2.35%') // toFixed rounding
    expect(formatPercent(-1)).toBe('-1.00%')
  })
})
