import clsx from 'clsx'
import { AlertCircle, Globe, Hourglass, LineChart, Newspaper, Search, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import Markdown from 'react-markdown'
import { softSpring } from '../../lib/motion'
import { CompareChart } from '../chart/CompareChart'

const TOOL_LABEL = {
  web_search: { label: 'Searching the web', icon: Globe },
  get_crypto_news: { label: 'Reading the news', icon: Newspaper },
  rate_limit_wait: { label: 'Free tier busy, waiting a few seconds', icon: Hourglass },
  search_coins: { label: 'Finding coins', icon: Search },
  get_market_overview: { label: 'Reading the market', icon: LineChart },
  get_coin: { label: 'Fetching coin data', icon: LineChart },
  get_price_history: { label: 'Analysing price history', icon: LineChart },
  show_chart: { label: 'Drawing a chart', icon: LineChart },
}

const dedupe = (items) => [...new Map(items.map((s) => [s.url, s])).values()]

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const tools = [...new Set(message.tools ?? [])]
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={softSpring}
      className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      {isUser ? (
        <div className="max-w-[85%] rounded-[22px] rounded-br-md bg-gradient-to-b from-[#3d9bff] to-accent px-4 py-2.5 text-[15px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]">
          {message.text}
        </div>
      ) : (
        <div className="w-full max-w-[95%]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted">
            <Sparkles className="size-3.5 text-violet" /> Copilot
          </div>
          {tools.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tools.map((t) => {
                const { label, icon: Icon } = TOOL_LABEL[t] ?? { label: t, icon: Search }
                return (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] text-muted ring-1 ring-white/10"
                  >
                    <Icon className="size-3" /> {label}
                  </motion.span>
                )
              })}
            </div>
          )}
          {message.text ? (
            <div className="prose-chat text-[15px] leading-relaxed text-ink/90">
              <Markdown components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}>{message.text}</Markdown>
            </div>
          ) : (
            message.status !== 'error' && <ThinkingDots />
          )}
          {message.charts?.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={softSpring}
              className="glass-card mt-3 rounded-2xl p-3"
            >
              <p className="mb-1 text-[12px] text-muted">
                {c.coinIds.join(' vs ')} · {c.days}d performance
              </p>
              <CompareChart coinIds={c.coinIds} days={c.days} height={200} />
            </motion.div>
          ))}
          {message.sources?.length > 0 && message.status === 'done' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              <p className="mb-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">Sources</p>
              <ul className="space-y-1">
                {dedupe(message.sources).slice(0, 4).map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-2 rounded-xl px-2 py-1.5 text-[13px] text-muted hover:bg-white/[0.06] hover:text-ink"
                    >
                      <Newspaper className="mt-0.5 size-3.5 shrink-0" />
                      <span className="line-clamp-1">
                        <span className="font-medium text-ink/80">{s.source}</span> · {s.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          {message.status === 'error' && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-down">
              <AlertCircle className="size-4" /> {message.error}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
