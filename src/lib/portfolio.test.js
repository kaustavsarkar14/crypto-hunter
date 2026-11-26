import { describe, expect, it } from 'vitest'
import { computeHoldings, valueHoldings } from './portfolio'

const tx = (type, qty, priceUsd, date, coinId = 'bitcoin') => ({ id: `${type}${date}`, coinId, type, qty, priceUsd, date })

describe('computeHoldings (average cost)', () => {
  it('averages buys and realises P&L on sells', () => {
    const [h] = computeHoldings([
      tx('buy', 1, 30000, '2026-01-01'),
      tx('buy', 1, 50000, '2026-02-01'),
      tx('sell', 1, 60000, '2026-03-01'),
    ])
    expect(h.qty).toBe(1)
    expect(h.avgCostUsd).toBe(40000)
    expect(h.realizedUsd).toBe(20000)
  })

  it('processes transactions in date order regardless of entry order', () => {
    const [h] = computeHoldings([tx('sell', 1, 60000, '2026-03-01'), tx('buy', 2, 40000, '2026-01-01')])
    expect(h.qty).toBe(1)
    expect(h.realizedUsd).toBe(20000)
  })

  it('cannot sell more than it holds', () => {
    const [h] = computeHoldings([tx('buy', 1, 100, '2026-01-01'), tx('sell', 5, 200, '2026-01-02')])
    expect(h.qty).toBe(0)
    expect(h.realizedUsd).toBe(100)
  })
})

describe('valueHoldings', () => {
  it('values in display currency with weights and totals', () => {
    const holdings = computeHoldings([
      tx('buy', 1, 100, '2026-01-01', 'a'),
      tx('buy', 3, 100, '2026-01-01', 'b'),
    ])
    const prices = { a: 200 * 2, b: 100 * 2 } // display currency = 2× USD
    const s = valueHoldings(holdings, (id) => prices[id], 2)
    expect(s.totalValue).toBe(1000)
    expect(s.totalCost).toBe(800)
    expect(s.totalPnlPct).toBeCloseTo(25)
    expect(s.rows[0].coinId).toBe('b')
    expect(s.rows[0].weight).toBeCloseTo(0.6)
  })
})
