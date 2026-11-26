import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchCoin, fetchFx, fetchGlobal, fetchMarketChart, fetchMarkets, fetchNews, fetchOhlc } from '../lib/api'
import { HAS_API } from '../lib/env'
import { convertMarkets } from '../lib/markets'
import { useSettings } from '../store/settings'

export function useMarkets() {
  const currency = useSettings((s) => s.currency)
  const { data: fx } = useFx()
  return useQuery({
    queryKey: ['markets', currency],
    queryFn: () => fetchMarkets(currency),
    staleTime: 60_000,
    refetchInterval: 180_000,
    // While a new currency loads, show the previous rows converted at the FX rate.
    placeholderData: (prev, prevQuery) => {
      const from = prevQuery?.queryKey[1]?.toLowerCase()
      const t = fx?.tether
      if (!prev || !from || !t?.[from]) return undefined
      return convertMarkets(prev, t[currency.toLowerCase()] / t[from])
    },
  })
}

/** Lookup map id → market row, shared by every page. */
export function useMarketMap() {
  const { data } = useMarkets()
  return useMemo(() => (data ? new Map(data.map((c) => [c.id, c])) : undefined), [data])
}

export function useCoin(id) {
  return useQuery({ queryKey: ['coin', id], queryFn: () => fetchCoin(id), staleTime: 300_000, enabled: !!id })
}

export function useChart(id, days, kind = 'area') {
  const currency = useSettings((s) => s.currency)
  return useQuery({
    queryKey: ['chart', kind, id, currency, days],
    queryFn: () => (kind === 'candles' ? fetchOhlc(id, currency, days) : fetchMarketChart(id, currency, days)),
    staleTime: days <= 1 ? 60_000 : 300_000,
    // Keep the old chart on screen while a new range loads, but never hand
    // line data ({prices}) to the candlestick renderer (an array of OHLC tuples).
    placeholderData: (prev, prevQuery) =>
      prevQuery?.queryKey[1] === kind && prevQuery?.queryKey[3] === currency ? prev : undefined,
    enabled: !!id,
  })
}

export function useCharts(ids, days) {
  const currency = useSettings((s) => s.currency)
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['chart', 'area', id, currency, days],
      queryFn: () => fetchMarketChart(id, currency, days),
      staleTime: 300_000,
      enabled: !!id,
    })),
  })
}

export function useFx() {
  return useQuery({ queryKey: ['fx'], queryFn: fetchFx, staleTime: 600_000 })
}

/** Price of 1 USDT in the display currency, and USD → display currency. */
export function useRates() {
  const currency = useSettings((s) => s.currency)
  const { data } = useFx()
  const t = data?.tether
  const cur = currency.toLowerCase()
  return {
    currency,
    usdtRate: t?.[cur] ?? (currency === 'USD' ? 1 : null),
    usdToCur: t ? t[cur] / t.usd : currency === 'USD' ? 1 : null,
  }
}

export function useGlobal() {
  return useQuery({ queryKey: ['global'], queryFn: fetchGlobal, staleTime: 300_000 })
}

const NEWS_KEY = 'ch:news'
const NEWS_TTL = 5 * 60_000

function readNewsCache() {
  try {
    return JSON.parse(localStorage.getItem(NEWS_KEY)) ?? undefined
  } catch {
    return undefined
  }
}

/**
 * Three cache layers: Cloudflare edge (5 min) → TanStack Query in memory → localStorage.
 * The localStorage copy renders instantly on the next visit, then refreshes in the background
 * (stale-while-revalidate).
 */
export function useNews() {
  return useQuery({
    enabled: HAS_API,
    queryKey: ['news'],
    queryFn: async () => {
      const data = await fetchNews(12)
      try {
        localStorage.setItem(NEWS_KEY, JSON.stringify({ data, savedAt: Date.now() }))
      } catch {
        /* storage full or disabled */
      }
      return data
    },
    initialData: () => readNewsCache()?.data,
    initialDataUpdatedAt: () => readNewsCache()?.savedAt,
    staleTime: NEWS_TTL,
    refetchInterval: NEWS_TTL,
    refetchOnWindowFocus: true, // a failed load recovers when you come back to the tab
    retry: 3,
    retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 15_000),
  })
}
