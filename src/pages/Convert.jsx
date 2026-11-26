import { ArrowDownUp } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { CoinPicker } from '../components/market/CoinPicker'
import { Glass } from '../components/ui/Glass'
import { LargeTitle } from '../components/ui/LargeTitle'
import { PriceText } from '../components/ui/PriceText'
import { useMarketMap } from '../hooks/queries'
import { useLiveQuote } from '../hooks/useLiveQuote'
import { formatNumber } from '../lib/format'
import { bouncy, fadeUp, stagger } from '../lib/motion'
import { useSettings } from '../store/settings'

export default function Convert() {
  const markets = useMarketMap()
  const currency = useSettings((s) => s.currency)
  const [params, setParams] = useSearchParams()
  const from = params.get('from') ?? 'bitcoin'
  const to = params.get('to') ?? 'ethereum'
  const [amount, setAmount] = useState('1')
  const [turns, setTurns] = useState(0)
  const a = markets?.get(from)
  const b = markets?.get(to)
  const qa = useLiveQuote(a)
  const qb = useLiveQuote(b)

  const set = (patch) =>
    setParams((p) => {
      for (const [k, v] of Object.entries(patch)) p.set(k, v)
      return p
    }, { replace: true })

  const n = parseFloat(amount) || 0
  const rate = qa.price && qb.price ? qa.price / qb.price : null
  const result = rate != null ? n * rate : null

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="mx-auto max-w-xl">
      <LargeTitle title="Convert" subtitle="Live cross rates between any two coins." />
      <motion.div variants={fadeUp}>
        <Glass material="glass" className="p-5 md:p-6">
          <p className="mb-2 text-[13px] font-medium text-muted">You send</p>
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount"
              className="tabular w-0 min-w-0 flex-1 bg-transparent text-[40px] font-semibold tracking-tight outline-none"
            />
            <div className="w-48">
              <CoinPicker coin={a} exclude={[to]} onChange={(c) => set({ from: c.id })} />
            </div>
          </div>
          <p className="mt-1 text-[14px] text-faint">
            ≈ <PriceText value={qa.price != null ? n * qa.price : null} currency={currency} />
          </p>

          <div className="relative my-4 flex justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-hairline" />
            <motion.button
              animate={{ rotate: turns * 180 }}
              transition={bouncy}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                setTurns((t) => t + 1)
                set({ from: to, to: from })
              }}
              aria-label="Swap coins"
              className="glass relative grid size-12 place-items-center rounded-full"
            >
              <ArrowDownUp className="size-5" />
            </motion.button>
          </div>

          <p className="mb-2 text-[13px] font-medium text-muted">You get</p>
          <div className="flex items-center gap-3">
            <motion.p
              key={result?.toPrecision(6)}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="tabular min-w-0 flex-1 truncate text-[40px] font-semibold tracking-tight"
            >
              {result == null ? '—' : formatNumber(result, result < 1 ? 8 : 4)}
            </motion.p>
            <div className="w-48">
              <CoinPicker coin={b} exclude={[from]} onChange={(c) => set({ to: c.id })} />
            </div>
          </div>
        </Glass>
      </motion.div>
      {a && b && rate != null && (
        <motion.p variants={fadeUp} className="tabular mt-4 text-center text-[14px] text-muted">
          1 {a.symbol.toUpperCase()} = {formatNumber(rate, rate < 1 ? 8 : 4)} {b.symbol.toUpperCase()}
          <span className="mx-2 text-faint">·</span>1 {b.symbol.toUpperCase()} = {formatNumber(1 / rate, 1 / rate < 1 ? 8 : 4)}{' '}
          {a.symbol.toUpperCase()}
        </motion.p>
      )}
    </motion.div>
  )
}
