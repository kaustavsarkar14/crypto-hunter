import { ArrowUp, RotateCcw, Sparkles, Square, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useMatch } from 'react-router'
import { bouncy, spring } from '../../lib/motion'
import { useUI } from '../../store/ui'
import { useCopilot } from './useCopilot'

// Markdown + chart code only downloads once someone opens the copilot.
const loadChatMessage = () => import('./ChatMessage')
const ChatMessage = lazy(() => loadChatMessage().then((m) => ({ default: m.ChatMessage })))

const SUGGESTIONS = [
  'Why is the market moving today?',
  'Compare ETH and SOL over the last 90 days',
  'How is my portfolio doing?',
  'Which top-20 coins have the strongest 7-day momentum?',
]

export function CopilotLauncher() {
  const { copilotOpen, openCopilot, closeCopilot, copilotPrompt, consumePrompt } = useUI()
  const { messages, busy, send, stop, reset, model } = useCopilot()
  const coinMatch = useMatch('/coin/:id')
  const pageCoinId = coinMatch?.params.id
  const [draft, setDraft] = useState('')
  const scroller = useRef(null)
  const input = useRef(null)

  // "Ask copilot" buttons elsewhere in the app hand us a prompt to send.
  useEffect(() => {
    if (copilotOpen && copilotPrompt) {
      send(copilotPrompt, { pageCoinId })
      consumePrompt()
    }
  }, [copilotOpen, copilotPrompt, send, consumePrompt, pageCoinId])

  useEffect(() => {
    if (!copilotOpen) return
    loadChatMessage()
    const t = setTimeout(() => input.current?.focus(), 250)
    return () => clearTimeout(t)
  }, [copilotOpen])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeCopilot()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        copilotOpen ? closeCopilot() : openCopilot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copilotOpen, openCopilot, closeCopilot])

  const submit = (text = draft) => {
    if (!text.trim()) return
    send(text, { pageCoinId })
    setDraft('')
  }

  return (
    <>
      <AnimatePresence>
        {!copilotOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={bouncy}
            onClick={() => openCopilot()}
            onPointerEnter={loadChatMessage}
            aria-label="Open AI copilot (⌘J)"
            className="fixed right-4 bottom-[calc(max(env(safe-area-inset-bottom),10px)+84px)] z-40 grid size-14 place-items-center rounded-full bg-gradient-to-br from-accent via-[#6e6bff] to-violet text-white shadow-[0_12px_36px_-6px_rgb(120_100_255/0.75),inset_0_1px_0_rgb(255_255_255/0.45)] lg:right-6 lg:bottom-6"
          >
            <motion.span animate={{ rotate: [0, 12, -8, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
              <Sparkles className="size-6" />
            </motion.span>
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-violet/30 [animation-duration:2.6s]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {copilotOpen && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="AI copilot"
            initial={{ opacity: 0, scale: 0.6, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.7, y: 30, filter: 'blur(10px)' }}
            transition={spring}
            style={{ transformOrigin: 'bottom right' }}
            className="glass-strong fixed inset-x-2 top-[max(env(safe-area-inset-top),12px)] bottom-[max(env(safe-area-inset-bottom),8px)] z-50 flex flex-col overflow-hidden rounded-[30px] md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:h-[min(700px,calc(100dvh-48px))] md:w-[440px]"
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-accent to-violet">
                  <Sparkles className="size-4 text-white" />
                </span>
                <div>
                  <p className="text-[15px] leading-tight font-semibold">Market Copilot</p>
                  <p className="text-[11px] text-muted">Live data · news{model ? ` · ${model}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={reset} aria-label="New chat" className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-ink">
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button onClick={closeCopilot} aria-label="Close copilot" className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-ink">
                  <X className="size-5" />
                </button>
              </div>
            </header>

            <div ref={scroller} className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-end">
                  <h2 className="text-[26px] leading-tight font-bold tracking-tight">
                    Ask anything about
                    <br />
                    <span className="bg-gradient-to-r from-teal via-accent to-violet bg-clip-text text-transparent">the crypto market.</span>
                  </h2>
                  <p className="mt-2 text-[14px] text-muted">
                    Uses live prices, the latest news, and your watchlist and portfolio. Not financial advice.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.08 + i * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => submit(s)}
                        className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left text-[14px] ring-1 ring-white/10 ring-inset hover:bg-white/[0.1]"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <Suspense fallback={null}>
                  {messages.map((m) => (
                    <ChatMessage key={m.id} message={m} />
                  ))}
                </Suspense>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="border-t border-hairline p-3"
            >
              <div className="flex items-end gap-2 rounded-[24px] bg-white/[0.07] p-1.5 pl-4 ring-1 ring-white/10 ring-inset focus-within:ring-accent/60">
                <textarea
                  ref={input}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                  placeholder={pageCoinId ? `Ask about ${pageCoinId}…` : 'Ask the copilot…'}
                  className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none [field-sizing:content] placeholder:text-faint"
                />
                <motion.button
                  type={busy ? 'button' : 'submit'}
                  onClick={busy ? stop : undefined}
                  whileTap={{ scale: 0.88 }}
                  transition={bouncy}
                  disabled={!busy && !draft.trim()}
                  aria-label={busy ? 'Stop' : 'Send'}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white disabled:bg-white/10 disabled:text-faint"
                >
                  {busy ? <Square className="size-3.5" fill="currentColor" /> : <ArrowUp className="size-[18px]" strokeWidth={2.6} />}
                </motion.button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
