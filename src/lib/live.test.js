import { describe, expect, it } from 'vitest'
import { parseMiniTickers, resolveQuote } from './live'

const btc = { symbol: 'btc', current_price: 64000, price_change_percentage_24h: 1 }

describe('resolveQuote', () => {
  it('falls back to the CoinGecko snapshot without a tick', () => {
    expect(resolveQuote(btc, undefined, 1)).toEqual({ price: 64000, change24h: 1, live: false })
  })

  it('converts USDT ticks into the display currency', () => {
    const inr = { ...btc, current_price: 64000 * 88 }
    const q = resolveQuote(inr, { price: 64100, open: 63000 }, 88)
    expect(q.live).toBe(true)
    expect(q.price).toBeCloseTo(64100 * 88)
    expect(q.change24h).toBeCloseTo(((64100 - 63000) / 63000) * 100)
  })

  it('ignores ticks that look like a different asset with the same ticker', () => {
    expect(resolveQuote(btc, { price: 12, open: 11 }, 1).live).toBe(false)
  })

  it('never streams stablecoins', () => {
    const usdt = { symbol: 'usdt', current_price: 1, price_change_percentage_24h: 0 }
    expect(resolveQuote(usdt, { price: 1.001, open: 1 }, 1).live).toBe(false)
  })
})

describe('parseMiniTickers', () => {
  it('keeps only USDT pairs and strips the quote asset', () => {
    const out = parseMiniTickers([
      { s: 'BTCUSDT', c: '64000.1', o: '63000', h: '65000', l: '62000', E: 1 },
      { s: 'ETHBTC', c: '0.05', o: '0.05', h: '0.05', l: '0.05', E: 1 },
    ])
    expect(Object.keys(out)).toEqual(['BTC'])
    expect(out.BTC.price).toBe(64000.1)
  })

  it('tolerates junk frames', () => {
    expect(parseMiniTickers(null)).toEqual({})
    expect(parseMiniTickers([{ nope: true }])).toEqual({})
  })
})
