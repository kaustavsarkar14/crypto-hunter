// Stablecoins track $1 — a USDT-quoted tick for them is meaningless.
export const STABLES = new Set(['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD', 'USDE', 'USDS', 'PYUSD', 'BUSD', 'USD1'])

// If a Binance symbol disagrees with CoinGecko by more than this, it is
// probably a different asset sharing the ticker — ignore the live feed.
const MAX_DEVIATION = 0.08

/**
 * Merge a CoinGecko snapshot with a live Binance mini-ticker.
 * @param coin  { symbol, current_price, price_change_percentage_24h }
 * @param tick  { price, open } in USDT, or undefined
 * @param usdtRate price of 1 USDT in the display currency
 */
export function resolveQuote(coin, tick, usdtRate) {
  const base = {
    price: coin?.current_price ?? null,
    change24h: coin?.price_change_percentage_24h ?? null,
    live: false,
  }
  const sym = coin?.symbol?.toUpperCase()
  if (!tick || !usdtRate || !sym || STABLES.has(sym)) return base
  const price = tick.price * usdtRate
  if (base.price && Math.abs(price - base.price) / base.price > MAX_DEVIATION) return base
  const change24h = tick.open ? ((tick.price - tick.open) / tick.open) * 100 : base.change24h
  return { price, change24h, live: true }
}

/** Parse one frame of Binance `!miniTicker@arr` into { SYMBOL: tick } for USDT pairs. */
export function parseMiniTickers(frame) {
  const out = {}
  if (!Array.isArray(frame)) return out
  for (const t of frame) {
    if (typeof t?.s !== 'string' || !t.s.endsWith('USDT')) continue
    out[t.s.slice(0, -4)] = { price: +t.c, open: +t.o, high: +t.h, low: +t.l, time: t.E }
  }
  return out
}
