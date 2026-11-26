import { describe, expect, it } from 'vitest'
import { convertMarkets, downsample, selectCoins } from './markets'

const coins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', market_cap_rank: 1, current_price: 64000, price_change_percentage_24h: -1.2, total_volume: 30 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', market_cap_rank: 2, current_price: 3200, price_change_percentage_24h: 2.5, total_volume: 20 },
  { id: 'solana', name: 'Solana', symbol: 'sol', market_cap_rank: 5, current_price: 150, price_change_percentage_24h: 6.1, total_volume: 10 },
]

describe('selectCoins', () => {
  it('does not mutate the input (v1 sorted React state in place)', () => {
    const copy = structuredClone(coins)
    selectCoins(coins, { sort: 'name-asc' })
    selectCoins(coins, { sort: 'price-asc' })
    expect(coins).toEqual(copy)
  })

  it('sorts gainers high → low (v1 had this reversed)', () => {
    expect(selectCoins(coins, { sort: 'change-desc' }).map((c) => c.id)).toEqual(['solana', 'ethereum', 'bitcoin'])
    expect(selectCoins(coins, { sort: 'change-asc' }).map((c) => c.id)).toEqual(['bitcoin', 'ethereum', 'solana'])
  })

  it('searches by name or symbol, case-insensitively', () => {
    expect(selectCoins(coins, { query: 'ETH' }).map((c) => c.id)).toEqual(['ethereum'])
    expect(selectCoins(coins, { query: 'sola' }).map((c) => c.id)).toEqual(['solana'])
  })

  it('filters gainers, losers and starred', () => {
    expect(selectCoins(coins, { filter: 'losers' }).map((c) => c.id)).toEqual(['bitcoin'])
    expect(selectCoins(coins, { filter: 'gainers' })).toHaveLength(2)
    expect(selectCoins(coins, { filter: 'starred', watchIds: ['solana'] }).map((c) => c.id)).toEqual(['solana'])
  })
})

describe('downsample', () => {
  it('keeps first and last points', () => {
    const pts = Array.from({ length: 168 }, (_, i) => i)
    const out = downsample(pts, 40)
    expect(out).toHaveLength(40)
    expect(out[0]).toBe(0)
    expect(out.at(-1)).toBe(167)
  })
})

describe('convertMarkets', () => {
  it('re-denominates money fields and sparklines, leaves percentages alone', () => {
    const [btc] = convertMarkets([{ ...coins[0], market_cap: 10, sparkline_in_7d: { price: [1, 2] } }], 88)
    expect(btc.current_price).toBe(64000 * 88)
    expect(btc.market_cap).toBe(880)
    expect(btc.sparkline_in_7d.price).toEqual([88, 176])
    expect(btc.price_change_percentage_24h).toBe(-1.2)
  })
})
