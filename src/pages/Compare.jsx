import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import { CompareChart } from '../components/chart/CompareChart'
import { SERIES_COLORS } from '../components/chart/theme'
import { CoinPicker } from '../components/market/CoinPicker'
import { Button } from '../components/ui/Button'
import { Glass } from '../components/ui/Glass'
import { LargeTitle } from '../components/ui/LargeTitle'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { useMarketMap } from '../hooks/queries'
import { useLiveQuote } from '../hooks/useLiveQuote'
import { formatCompact, formatPercent, formatPrice } from '../lib/format'
import { fadeUp, stagger } from '../lib/motion'
import { useSettings } from '../store/settings'
import { useUI } from '../store/ui'
import { HAS_API } from '../lib/env'

const RANGES = [
  { value: 7, label: '1W' },
  { value: 30, label: '1M' },
  { value: 90, label: '3M' },
  { value: 365, label: '1Y' },
]

const METRICS = [
  { label: 'Price', get: (c, q) => q.price, fmt: formatPrice },
  { label: '24h', get: (c, q) => q.change24h, fmt: (v) => formatPercent(v), better: 'high' },
  { label: '7d', get: (c) => c.price_change_percentage_7d_in_currency, fmt: (v) => formatPercent(v), better: 'high' },
  { label: 'Market cap', get: (c) => c.market_cap, fmt: formatCompact, better: 'high' },
  { label: 'Volume 24h', get: (c) => c.total_volume, fmt: formatCompact, better: 'high' },
  { label: 'From ATH', get: (c) => c.ath_change_percentage, fmt: (v) => formatPercent(v), better: 'high' },
]

function Column({ coin, color, other }) {
  const currency = useSettings((s) => s.currency)
  const q = useLiveQuote(coin)
  const oq = useLiveQuote(other)
  return (
    <div>
      {METRICS.map((m) => {
        const v = coin ? m.get(coin, q) : null
        const ov = other ? m.get(other, oq) : null
        const wins = m.better && v != null && ov != null && v > ov
        return (
          <div key={m.label} className="flex items-center justify-between border-b border-hairline py-3 last:border-0">
            <span className="text-[13px] text-faint">{m.label}</span>
            <span className="tabular text-[15px] font-semibold" style={wins ? { color } : undefined}>
              {v == null ? '—' : m.fmt(v, currency)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Compare() {
  const markets = useMarketMap()
  const [params, setParams] = useSearchParams()
  const a = params.get('a') ?? 'bitcoin'
  const b = params.get('b') ?? 'ethereum'
  const days = Number(params.get('days') ?? 30)
  const coinA = markets?.get(a)
  const coinB = markets?.get(b)
  const openCopilot = useUI((s) => s.openCopilot)

  const set = (key, value) =>
    setParams((p) => {
      p.set(key, value)
      return p
    }, { replace: true })

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <LargeTitle
        title="Compare"
        subtitle="Performance rebased to 0% so any two coins share one honest axis."
        trailing={
          HAS_API && coinA && coinB && (
            <Button onClick={() => openCopilot(`Compare ${coinA.name} and ${coinB.name} over the last ${days} days. Show a chart.`)}>
              <Sparkles className="size-4 text-violet" /> Explain with AI
            </Button>
          )
        }
      />
      <motion.div variants={fadeUp} className="grid gap-3 md:grid-cols-2">
        {[
          [coinA, 'a', b],
          [coinB, 'b', a],
        ].map(([coin, key, otherId], i) => (
          <div key={key} className="flex items-center gap-3">
            <span className="size-3 shrink-0 rounded-full" style={{ background: SERIES_COLORS[i] }} />
            <CoinPicker coin={coin} exclude={[otherId]} onChange={(c) => set(key, c.id)} />
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Glass className="mt-4 p-4 md:p-6">
          <div className="mb-4 flex justify-end">
            <SegmentedControl label="Time range" value={days} onChange={(v) => set('days', v)} options={RANGES} />
          </div>
          <CompareChart coinIds={[a, b]} days={days} />
        </Glass>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          [coinA, coinB, 0],
          [coinB, coinA, 1],
        ].map(([coin, other, i]) => (
          <Glass key={i} className="p-5">
            <p className="mb-1 text-[17px] font-semibold" style={{ color: SERIES_COLORS[i] }}>
              {coin?.name ?? '—'}
            </p>
            <Column coin={coin} other={other} color={SERIES_COLORS[i]} />
          </Glass>
        ))}
      </motion.div>
    </motion.div>
  )
}
