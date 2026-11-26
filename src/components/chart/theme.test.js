// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { toSeries } from './theme'

describe('toSeries', () => {
  it('converts ms → s and drops duplicate/out-of-order timestamps', () => {
    const out = toSeries([[1000, 1], [1000, 2], [500, 3], [2000, 4]], ([, value]) => ({ value }))
    expect(out).toEqual([{ time: 1, value: 1 }, { time: 2, value: 4 }])
  })

  it('returns [] for non-array input (regression: line data handed to the candle renderer crashed the page)', () => {
    expect(toSeries({ prices: [[1000, 1]] }, () => ({}))).toEqual([])
    expect(toSeries(undefined, () => ({}))).toEqual([])
  })
})
