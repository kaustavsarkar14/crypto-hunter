import { useMemo } from 'react'
import { useLive } from '../store/live'
import { resolveQuote } from '../lib/live'
import { useRates } from './queries'

/** Live price for a coin: Binance tick when available, CoinGecko snapshot otherwise. */
export function useLiveQuote(coin) {
  const { usdtRate } = useRates()
  const sym = coin?.symbol?.toUpperCase()
  const tick = useLive((s) => (sym ? s.prices[sym] : undefined))
  return useMemo(() => resolveQuote(coin, tick, usdtRate), [coin, tick, usdtRate])
}

/** Non-hook variant for lists of coins (portfolio totals, alerts engine). */
export function quoteFor(coin, prices, usdtRate) {
  return resolveQuote(coin, coin ? prices[coin.symbol?.toUpperCase()] : undefined, usdtRate)
}
