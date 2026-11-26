import { LayoutGrid, List, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CoinCard } from '../components/market/CoinCard'
import { CoinRow, ROW_GRID } from '../components/market/CoinRow'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Glass } from '../components/ui/Glass'
import { LargeTitle } from '../components/ui/LargeTitle'
import { Menu } from '../components/ui/Menu'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Skeleton } from '../components/ui/Skeleton'
import { useGlobal, useMarkets } from '../hooks/queries'
import { formatCompact, formatPercent } from '../lib/format'
import { SORTS, selectCoins } from '../lib/markets'
import { useSettings } from '../store/settings'
import { useWatchlist } from '../store/watchlist'

const PAGE = 36

function GlobalStats() {
  const currency = useSettings((s) => s.currency)
  const { data } = useGlobal()
  const g = data?.data
  const cur = currency.toLowerCase()
  const stats = [
    { label: 'Market cap', value: formatCompact(g?.total_market_cap?.[cur], currency), change: g?.market_cap_change_percentage_24h_usd },
    { label: '24h volume', value: formatCompact(g?.total_volume?.[cur], currency) },
    { label: 'BTC dominance', value: g ? formatPercent(g.market_cap_percentage.btc, { signed: false }) : '—' },
    { label: 'Active coins', value: g?.active_cryptocurrencies?.toLocaleString() ?? '—' },
  ]
  return (
    <div className="no-scrollbar -mx-4 mb-6 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
      {stats.map((s) => (
        <Glass key={s.label} className="min-w-40 shrink-0 rounded-3xl px-4 py-3.5">
          <p className="text-[12px] text-faint">{s.label}</p>
          <p className="tabular mt-1 text-[18px] font-semibold">
            {s.value}
            {s.change != null && (
              <span className={`ml-2 text-[12px] ${s.change >= 0 ? 'text-up' : 'text-down'}`}>{formatPercent(s.change)}</span>
            )}
          </p>
        </Glass>
      ))}
    </div>
  )
}

export default function Markets() {
  const { data, isLoading, error, refetch } = useMarkets()
  const watchIds = useWatchlist((s) => s.ids)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const deferredQuery = useDeferredValue(query)
  const sort = params.get('sort') ?? 'rank'
  const filter = params.get('filter') ?? 'all'
  const view = params.get('view') ?? 'grid'
  const [limit, setLimit] = useState(PAGE)
  const sentinel = useRef(null)

  // Sort/filter/view live in the URL so a view can be shared or bookmarked.
  const setParam = (key, value, fallback) =>
    setParams((p) => {
      value === fallback ? p.delete(key) : p.set(key, value)
      return p
    }, { replace: true })

  const coins = useMemo(
    () => selectCoins(data, { query: deferredQuery, sort, filter, watchIds }),
    [data, deferredQuery, sort, filter, watchIds],
  )
  const visible = coins.slice(0, limit)

  useEffect(() => setLimit(PAGE), [deferredQuery, sort, filter])

  // Infinite scroll
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible.length])

  return (
    <div>
      <LargeTitle title="Markets" subtitle="Top 250 cryptocurrencies, streaming live." />
      <GlobalStats />

      <div className="sticky top-[88px] z-30 -mx-2 mb-6 px-2">
        <Glass material="glass" className="flex flex-wrap items-center gap-2 rounded-[26px] p-2">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or symbol"
              aria-label="Search coins"
              className="h-10 w-full rounded-full bg-white/[0.07] pr-10 pl-10 text-[15px] outline-none placeholder:text-faint focus:bg-white/[0.1]"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-white/20"
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <SegmentedControl
            label="Filter"
            value={filter}
            onChange={(v) => setParam('filter', v, 'all')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'gainers', label: 'Gainers' },
              { value: 'losers', label: 'Losers' },
              { value: 'starred', label: 'Starred' },
            ]}
          />
          <Menu
            label="Sort by"
            value={sort}
            onChange={(v) => setParam('sort', v, 'rank')}
            options={Object.entries(SORTS).map(([value, s]) => ({ value, label: s.label }))}
          />
          <SegmentedControl
            label="Layout"
            value={view}
            onChange={(v) => setParam('view', v, 'grid')}
            options={[
              { value: 'grid', label: <span className="sr-only">Grid</span>, icon: <LayoutGrid className="size-4" /> },
              { value: 'list', label: <span className="sr-only">List</span>, icon: <List className="size-4" /> },
            ]}
          />
        </Glass>
      </div>

      {error && !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="h-[214px] rounded-[28px]" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No coins found"
          description={filter === 'starred' ? 'Star a coin to see it here.' : `Nothing matches “${query}”.`}
          action={<Button onClick={() => (setQuery(''), setParam('filter', 'all', 'all'))}>Clear filters</Button>}
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c, i) => (
            <CoinCard key={c.id} coin={c} index={i % PAGE} />
          ))}
        </div>
      ) : (
        <Glass className="p-2">
          <div className={`${ROW_GRID} px-3 py-2 text-[12px] font-medium text-faint md:px-4`}>
            <span className="hidden md:block">#</span>
            <span>Coin</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h</span>
            <span className="hidden text-right md:block">7 days</span>
            <span className="hidden text-right md:block">Market cap</span>
            <span className="hidden md:block" />
          </div>
          <ul>
            {visible.map((c, i) => (
              <CoinRow key={c.id} coin={c} index={i % PAGE} />
            ))}
          </ul>
        </Glass>
      )}
      {visible.length < coins.length && <div ref={sentinel} className="h-10" />}
    </div>
  )
}
