import { Plus, Sparkles, Trash2, Wallet } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AddTransactionSheet } from '../components/portfolio/AddTransactionSheet'
import { AllocationDonut, allocationColor } from '../components/portfolio/AllocationDonut'
import { Button } from '../components/ui/Button'
import { CoinLogo } from '../components/ui/CoinLogo'
import { EmptyState } from '../components/ui/EmptyState'
import { Glass } from '../components/ui/Glass'
import { LargeTitle } from '../components/ui/LargeTitle'
import { PriceText } from '../components/ui/PriceText'
import { useMarketMap, useRates } from '../hooks/queries'
import { quoteFor } from '../hooks/useLiveQuote'
import { formatNumber, formatPercent, formatPrice } from '../lib/format'
import { fadeUp, softSpring, stagger } from '../lib/motion'
import { computeHoldings, valueHoldings } from '../lib/portfolio'
import { useLive } from '../store/live'
import { usePortfolio } from '../store/portfolio'
import { useUI } from '../store/ui'
import { HAS_API } from '../lib/env'

function Pnl({ value, pct, currency, className = '' }) {
  if (value == null) return <span className="text-faint">—</span>
  const up = value >= 0
  return (
    <span className={`tabular ${up ? 'text-up' : 'text-down'} ${className}`}>
      {up ? '+' : '−'}
      {formatPrice(Math.abs(value), currency)}
      {pct != null && <span className="ml-1.5 opacity-80">({formatPercent(pct)})</span>}
    </span>
  )
}

export default function Portfolio() {
  const txs = usePortfolio((s) => s.txs)
  const removeTx = usePortfolio((s) => s.removeTx)
  const markets = useMarketMap()
  const prices = useLive((s) => s.prices)
  const { currency, usdtRate, usdToCur } = useRates()
  const openCopilot = useUI((s) => s.openCopilot)
  const [adding, setAdding] = useState(false)

  const holdings = useMemo(() => computeHoldings(txs), [txs])
  const summary = useMemo(
    () =>
      valueHoldings(holdings, (id) => quoteFor(markets?.get(id), prices, usdtRate).price, usdToCur ?? 1),
    [holdings, markets, prices, usdtRate, usdToCur],
  )

  if (txs.length === 0) {
    return (
      <div>
        <LargeTitle title="Portfolio" />
        <EmptyState
          icon={Wallet}
          title="Start your portfolio"
          description="Log your buys and sells. Value and profit update live with the market. Everything stays on this device."
          action={
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="size-4" /> Add first transaction
            </Button>
          }
        />
        <AddTransactionSheet open={adding} onOpenChange={setAdding} />
      </div>
    )
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <LargeTitle
        title="Portfolio"
        trailing={
          <div className="flex gap-2">
            {HAS_API && (
              <Button onClick={() => openCopilot('Review my portfolio: performance, concentration risk, and anything notable in the market affecting my holdings.')}>
                <Sparkles className="size-4 text-violet" /> Review with AI
              </Button>
            )}
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
        }
      />

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Glass material="glass" className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/25 blur-3xl" />
          <p className="relative text-[14px] font-medium text-muted">Total balance</p>
          <PriceText value={summary.totalValue} currency={currency} className="relative mt-1 text-[44px] font-bold tracking-[-0.03em] md:text-[56px]" />
          <div className="relative mt-2 text-[16px] font-medium">
            <Pnl value={summary.totalPnl} pct={summary.totalPnlPct} currency={currency} />
            <span className="ml-2 text-[13px] text-faint">all-time</span>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-4 border-t border-hairline pt-5">
            <div>
              <p className="text-[12px] text-faint">Cost basis</p>
              <p className="tabular mt-0.5 text-[17px] font-semibold">{formatPrice(summary.totalCost, currency)}</p>
            </div>
            <div>
              <p className="text-[12px] text-faint">Assets</p>
              <p className="mt-0.5 text-[17px] font-semibold">{summary.rows.length}</p>
            </div>
          </div>
        </Glass>

        <Glass className="flex items-center gap-6 p-6">
          <AllocationDonut rows={summary.rows}>
            <div>
              <p className="text-[12px] text-faint">Allocation</p>
              <p className="text-[20px] font-semibold">{summary.rows.length}</p>
            </div>
          </AllocationDonut>
          <ul className="min-w-0 flex-1 space-y-2.5">
            {summary.rows.slice(0, 6).map((r, i) => {
              const coin = markets?.get(r.coinId)
              return (
                <li key={r.coinId} className="flex items-center gap-2 text-[14px]">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: allocationColor(i) }} />
                  <span className="flex-1 truncate">{coin?.name ?? r.coinId}</span>
                  <span className="tabular text-muted">{(r.weight * 100).toFixed(1)}%</span>
                </li>
              )
            })}
          </ul>
        </Glass>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Glass className="mt-4 p-2">
          <h2 className="px-4 pt-3 pb-2 text-[17px] font-semibold">Holdings</h2>
          <ul>
            {summary.rows.map((r) => {
              const coin = markets?.get(r.coinId)
              return (
                <li key={r.coinId}>
                  <Link
                    to={`/coin/${r.coinId}`}
                    viewTransition
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/[0.06] md:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CoinLogo src={coin?.image} className="size-9" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{coin?.name ?? r.coinId}</p>
                        <p className="tabular text-[12px] text-muted">
                          {formatNumber(r.qty, 6)} {coin?.symbol?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[11px] text-faint">Price</p>
                      <PriceText value={r.price} currency={currency} className="text-[14px]" />
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[11px] text-faint">Avg cost</p>
                      <p className="tabular text-[14px]">{formatPrice(r.avgCostUsd * (usdToCur ?? 1), currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="hidden text-[11px] text-faint md:block">Value</p>
                      <PriceText value={r.value} currency={currency} className="text-[15px] font-semibold" />
                      <Pnl value={r.pnl} pct={r.pnlPct} currency={currency} className="block text-[12px] md:hidden" />
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[11px] text-faint">P&L</p>
                      <Pnl value={r.pnl} pct={r.pnlPct} currency={currency} className="text-[14px]" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Glass>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Glass className="mt-4 p-2">
          <h2 className="px-4 pt-3 pb-2 text-[17px] font-semibold">Transactions</h2>
          <ul>
            <AnimatePresence initial={false}>
              {[...txs]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((tx) => {
                  const coin = markets?.get(tx.coinId)
                  return (
                    <motion.li
                      key={tx.id}
                      layout
                      exit={{ opacity: 0, height: 0, x: -30 }}
                      transition={softSpring}
                      className="flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-2.5 hover:bg-white/[0.04]"
                    >
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${tx.type === 'buy' ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}
                      >
                        {tx.type}
                      </span>
                      <span className="tabular flex-1 truncate text-[14px]">
                        {formatNumber(tx.qty, 6)} {coin?.symbol?.toUpperCase() ?? tx.coinId} @{' '}
                        {formatPrice(tx.priceUsd * (usdToCur ?? 1), currency)}
                      </span>
                      <span className="text-[13px] text-faint">{new Date(tx.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => removeTx(tx.id)}
                        aria-label="Delete transaction"
                        className="grid size-8 place-items-center rounded-full text-faint hover:bg-down/15 hover:text-down"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </motion.li>
                  )
                })}
            </AnimatePresence>
          </ul>
        </Glass>
      </motion.div>

      <AddTransactionSheet open={adding} onOpenChange={setAdding} />
    </motion.div>
  )
}
