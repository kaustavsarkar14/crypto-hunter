import { ArrowLeft, Bell, ExternalLink, Plus, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AlertSheet } from '../components/alerts/AlertSheet'
import { PriceChart } from '../components/chart/PriceChart'
import { StarButton } from '../components/market/StarButton'
import { AddTransactionSheet } from '../components/portfolio/AddTransactionSheet'
import { Button } from '../components/ui/Button'
import { ChangePill } from '../components/ui/ChangePill'
import { CoinLogo } from '../components/ui/CoinLogo'
import { ErrorState } from '../components/ui/ErrorState'
import { Glass } from '../components/ui/Glass'
import { PriceText } from '../components/ui/PriceText'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Skeleton } from '../components/ui/Skeleton'
import { useCoin, useMarketMap } from '../hooks/queries'
import { useLiveQuote } from '../hooks/useLiveQuote'
import { formatCompact, formatCompactNumber, formatPercent, formatPrice, stripHtml } from '../lib/format'
import { fadeUp, softSpring, stagger } from '../lib/motion'
import { useSettings } from '../store/settings'
import { useUI } from '../store/ui'
import { useBackend } from '../hooks/useBackend'

const RANGES = [
  { value: 1, label: '1D' },
  { value: 7, label: '1W' },
  { value: 30, label: '1M' },
  { value: 90, label: '3M' },
  { value: 365, label: '1Y' },
]

export default function CoinDetail() {
  const { copilot } = useBackend()
  const { id } = useParams()
  const currency = useSettings((s) => s.currency)
  const cur = currency.toLowerCase()
  const openCopilot = useUI((s) => s.openCopilot)
  const markets = useMarketMap()
  const { data: detail, isLoading, error, refetch } = useCoin(id)
  const [days, setDays] = useState(30)
  const [kind, setKind] = useState('area')
  const [sheet, setSheet] = useState(null)
  const [expanded, setExpanded] = useState(false)

  // Prefer the markets row (already cached, same shape as cards) so the header renders instantly.
  const coin = useMemo(() => {
    const row = markets?.get(id)
    if (row) return row
    if (!detail) return null
    const m = detail.market_data
    return {
      id: detail.id,
      name: detail.name,
      symbol: detail.symbol,
      image: detail.image?.large,
      market_cap_rank: detail.market_cap_rank,
      current_price: m?.current_price?.[cur],
      price_change_percentage_24h: m?.price_change_percentage_24h,
    }
  }, [markets, detail, id, cur])

  const { price, change24h, live } = useLiveQuote(coin)

  if (error && !coin) return <ErrorState error={error} onRetry={refetch} />

  const m = detail?.market_data
  const stats = [
    ['Market cap', formatCompact(m?.market_cap?.[cur], currency)],
    ['24h volume', formatCompact(m?.total_volume?.[cur], currency)],
    ['24h high', formatPrice(m?.high_24h?.[cur], currency)],
    ['24h low', formatPrice(m?.low_24h?.[cur], currency)],
    ['All-time high', formatPrice(m?.ath?.[cur], currency), m?.ath_change_percentage?.[cur]],
    ['Circulating', `${formatCompactNumber(m?.circulating_supply)} ${coin?.symbol?.toUpperCase() ?? ''}`],
    ['Max supply', m?.max_supply ? formatCompactNumber(m.max_supply) : '∞'],
    ['7d change', formatPercent(m?.price_change_percentage_7d)],
  ]
  const about = stripHtml(detail?.description?.en)

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <Link to="/markets" viewTransition className="mb-5 inline-flex items-center gap-1.5 text-[15px] text-accent">
          <ArrowLeft className="size-4" /> Markets
        </Link>
      </motion.div>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {coin ? (
            <CoinLogo src={coin.image} id={id} vt className="size-16 md:size-20" />
          ) : (
            <Skeleton className="size-16 rounded-full md:size-20" />
          )}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2">
              <h1 className="text-[30px] font-bold tracking-[-0.03em] md:text-[40px]">{coin?.name ?? '…'}</h1>
              <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[12px] font-semibold text-muted uppercase">{coin?.symbol}</span>
              {coin?.market_cap_rank && <span className="text-[13px] text-faint">#{coin.market_cap_rank}</span>}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <PriceText value={price} currency={currency} className="text-[28px] font-semibold tracking-tight md:text-[34px]" />
              <ChangePill value={change24h} />
              {live && <span className="text-[12px] font-medium text-up">● Live</span>}
            </div>
          </motion.div>
        </div>
        {coin && (
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
            <StarButton coin={coin} className="glass size-10" />
            <Button onClick={() => setSheet('tx')}>
              <Plus className="size-4" /> Portfolio
            </Button>
            <Button onClick={() => setSheet('alert')}>
              <Bell className="size-4" /> Alert
            </Button>
            {copilot && (
              <Button
                variant="primary"
                onClick={() => openCopilot(`Give me a concise analysis of ${coin.name}: recent price action, what's driving it, and key levels.`)}
              >
                <Sparkles className="size-4" /> Ask AI
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <motion.div variants={fadeUp}>
        <Glass className="mt-8 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl label="Time range" value={days} onChange={setDays} options={RANGES} />
            <SegmentedControl
              label="Chart type"
              value={kind}
              onChange={setKind}
              options={[
                { value: 'area', label: 'Line' },
                { value: 'candles', label: 'Candles' },
              ]}
            />
          </div>
          <PriceChart coinId={id} days={days} kind={kind} currency={currency} livePrice={live ? price : null} />
        </Glass>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value, change]) => (
          <Glass key={label} className="rounded-3xl px-4 py-3.5">
            <p className="text-[12px] text-faint">{label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-5 w-24" />
            ) : (
              <p className="tabular mt-1 text-[16px] font-semibold">
                {value}
                {change != null && <span className="ml-1.5 text-[12px] font-medium text-down">{formatPercent(change)}</span>}
              </p>
            )}
          </Glass>
        ))}
      </motion.div>

      {about && (
        <motion.div variants={fadeUp}>
          <Glass className="mt-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold">About {coin?.name}</h2>
              {detail?.links?.homepage?.[0] && (
                <a href={detail.links.homepage[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[14px] text-accent">
                  Website <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <motion.div
              animate={{ height: expanded ? 'auto' : 112 }}
              transition={softSpring}
              className="relative mt-3 overflow-hidden"
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-muted">{about}</p>
              <AnimatePresence>
                {!expanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0f16] to-transparent"
                  />
                )}
              </AnimatePresence>
            </motion.div>
            {about.length > 360 && (
              <button onClick={() => setExpanded((e) => !e)} className="mt-2 text-[14px] font-medium text-accent">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </Glass>
        </motion.div>
      )}

      <AddTransactionSheet open={sheet === 'tx'} onOpenChange={(o) => !o && setSheet(null)} initialCoin={coin} />
      <AlertSheet open={sheet === 'alert'} onOpenChange={(o) => !o && setSheet(null)} initialCoin={coin} />
    </motion.div>
  )
}
