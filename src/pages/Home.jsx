import { ArrowRight, Bell, Radio, Sparkles, Wallet } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { LiveTicker } from '../components/market/LiveTicker'
import { NewsCarousel } from '../components/news/NewsCarousel'
import { ChangePill } from '../components/ui/ChangePill'
import { CoinLogo } from '../components/ui/CoinLogo'
import { Glass } from '../components/ui/Glass'
import { PriceText } from '../components/ui/PriceText'
import { Sparkline } from '../components/ui/Sparkline'
import { useMarkets } from '../hooks/queries'
import { useLiveQuote } from '../hooks/useLiveQuote'
import { fadeUp, softSpring, stagger } from '../lib/motion'
import { useSettings } from '../store/settings'
import { useUI } from '../store/ui'
import { HAS_API } from '../lib/env'

const FEATURES = [
  { icon: Radio, title: 'Streaming prices', body: 'WebSocket ticks from Binance, batched to one render per frame.', tint: 'from-up/30' },
  { icon: Sparkles, title: 'AI copilot', body: 'Ask in plain English. Claude reads live data and the web, then answers with charts.', tint: 'from-violet/35' },
  { icon: Wallet, title: 'Portfolio', body: 'Track holdings with average-cost P&L, valued at live prices.', tint: 'from-accent/35' },
  { icon: Bell, title: 'Price alerts', body: 'Set a target and get notified the moment it crosses.', tint: 'from-orange/30' },
]

function PreviewRow({ coin }) {
  const currency = useSettings((s) => s.currency)
  const { price, change24h } = useLiveQuote(coin)
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/5">
      <CoinLogo src={coin.image} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{coin.name}</p>
        <p className="text-[12px] text-muted uppercase">{coin.symbol}</p>
      </div>
      <Sparkline data={coin.sparkline_in_7d?.price} width={64} height={26} className="hidden sm:block" />
      <div className="w-28 text-right">
        <PriceText value={price} currency={currency} className="text-[15px] font-semibold" />
        <div className="mt-0.5 flex justify-end">
          <ChangePill value={change24h} size="sm" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data } = useMarkets()
  const openCopilot = useUI((s) => s.openCopilot)
  const top = data?.slice(0, 5) ?? []

  return (
    <div>
      <section className="grid items-center gap-12 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <motion.div variants={stagger(0.09)} initial="hidden" animate="show">
          <motion.span variants={fadeUp} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] text-muted">
            <Sparkles className="size-3.5 text-violet" /> Now with an AI market copilot
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-6 text-[52px] leading-[0.95] font-bold tracking-[-0.045em] md:text-[84px]">
            Track crypto
            <br />
            <span className="bg-gradient-to-r from-teal via-accent to-violet bg-clip-text text-transparent">in real time.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-[18px] leading-relaxed text-muted">
            Live prices for 250 coins, candlestick charts, a portfolio that values itself, alerts that fire when they cross,
            and a copilot that explains the market.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={softSpring}>
              <Link
                to="/markets"
                viewTransition
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-b from-[#3d9bff] to-accent px-6 text-[17px] font-semibold text-white shadow-[0_10px_30px_-6px_rgb(10_132_255/0.7),inset_0_1px_0_rgb(255_255_255/0.35)]"
              >
                Open markets <ArrowRight className="size-[18px]" />
              </Link>
            </motion.div>
            {HAS_API && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={softSpring}
                onClick={() => openCopilot('Give me a quick briefing on the crypto market right now.')}
                className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-[17px] font-medium"
              >
                <Sparkles className="size-[18px] text-violet" /> Ask the copilot
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 18, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ ...softSpring, delay: 0.25 }}
          style={{ perspective: 1200 }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <Glass material="glass" className="relative mx-auto max-w-md overflow-hidden p-3">
              <div className="flex items-center justify-between px-3 pt-2 pb-3">
                <p className="text-[13px] font-semibold text-muted">Top by market cap</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-up">
                  <span className="size-1.5 animate-pulse rounded-full bg-up" /> Live
                </span>
              </div>
              {top.length
                ? top.map((c) => <PreviewRow key={c.id} coin={c} />)
                : Array.from({ length: 5 }, (_, i) => <div key={i} className="shimmer m-2 h-12 rounded-2xl" />)}
            </Glass>
          </motion.div>
        </motion.div>
      </section>

      <div className="mt-16">
        <LiveTicker />
      </div>

      <NewsCarousel />

      <motion.section
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map(({ icon: Icon, title, body, tint }) => (
          <motion.div key={title} variants={fadeUp} whileHover={{ y: -6 }} transition={softSpring}>
            <Glass interactive className="h-full overflow-hidden p-6">
              <div className={`pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-gradient-to-br ${tint} to-transparent blur-2xl`} />
              <div className="relative grid size-11 place-items-center rounded-2xl bg-white/[0.08] ring-1 ring-white/10">
                <Icon className="size-5" />
              </div>
              <h3 className="relative mt-5 text-[18px] font-semibold">{title}</h3>
              <p className="relative mt-1.5 text-[14px] leading-relaxed text-muted">{body}</p>
            </Glass>
          </motion.div>
        ))}
      </motion.section>
    </div>
  )
}
