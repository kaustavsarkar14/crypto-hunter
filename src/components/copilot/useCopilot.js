import { useCallback, useRef, useState } from 'react'
import { computeHoldings } from '../../lib/portfolio'
import { usePortfolio } from '../../store/portfolio'
import { useSettings } from '../../store/settings'
import { useWatchlist } from '../../store/watchlist'
import { readSSE } from './sse'

// Dev: Vite proxies /api to `wrangler dev`. Prod: VITE_API_URL points at the deployed Worker.
const ENDPOINT = `${import.meta.env.VITE_API_URL ?? ''}/api/chat`
const HISTORY_LIMIT = 12

/** What the copilot knows about the user — sent as context, never stored server-side. */
function appContext(pageCoinId) {
  const { currency } = useSettings.getState()
  const holdings = computeHoldings(usePortfolio.getState().txs)
    .filter((h) => h.qty > 0)
    .map((h) => ({ coin_id: h.coinId, qty: +h.qty.toPrecision(6), avg_cost_usd: +h.avgCostUsd.toPrecision(6) }))
  return {
    currency,
    viewing_coin: pageCoinId ?? null,
    watchlist: useWatchlist.getState().ids.slice(0, 30),
    holdings: holdings.slice(0, 30),
    now: new Date().toISOString(),
  }
}

/**
 * message: { id, role, text, charts: [{coinIds, days}], tools: [name], status }
 */
export function useCopilot() {
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [model, setModel] = useState(null)
  const abort = useRef(null)

  const patchLast = (fn) =>
    setMessages((m) => {
      const copy = m.slice()
      copy[copy.length - 1] = fn(copy[copy.length - 1])
      return copy
    })

  const send = useCallback(
    async (text, { pageCoinId } = {}) => {
      const content = text.trim()
      if (!content || busy) return
      const user = { id: crypto.randomUUID(), role: 'user', text: content }
      const assistant = { id: crypto.randomUUID(), role: 'assistant', text: '', charts: [], tools: [], status: 'thinking' }
      const history = [...messages, user]
        .filter((m) => m.text)
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.text }))
      setMessages((m) => [...m, user, assistant])
      setBusy(true)
      abort.current = new AbortController()

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, context: appContext(pageCoinId) }),
          signal: abort.current.signal,
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `Copilot unavailable (${res.status})`)
        }
        let text = ''
        let turnStart = 0
        for await (const { event, data } of readSSE(res)) {
          switch (event) {
            case 'meta': // which model is answering
              setModel(data.model)
              break
            case 'turn': // a new model turn begins (after tool results)
              turnStart = text.length
              break
            case 'retry': // server re-issued a turn; drop its partial text
              text = text.slice(0, turnStart)
              patchLast((a) => ({ ...a, text }))
              break
            case 'text':
              text += data.delta
              patchLast((a) => ({ ...a, status: 'streaming', text }))
              break
            case 'tool':
              patchLast((a) => ({ ...a, status: 'tool', tools: [...a.tools, data.name] }))
              break
            case 'sources':
              patchLast((a) => ({ ...a, sources: [...(a.sources ?? []), ...data] }))
              break
            case 'chart':
              patchLast((a) => ({ ...a, charts: [...a.charts, data] }))
              break
            case 'error':
              throw new Error(data.message)
          }
        }
        patchLast((a) => ({ ...a, status: 'done' }))
      } catch (err) {
        if (err.name === 'AbortError') patchLast((a) => ({ ...a, status: 'done', text: a.text || '_Stopped._' }))
        else patchLast((a) => ({ ...a, status: 'error', error: err.message }))
      } finally {
        setBusy(false)
        abort.current = null
      }
    },
    [busy, messages],
  )

  const stop = useCallback(() => abort.current?.abort(), [])
  const reset = useCallback(() => {
    abort.current?.abort()
    setMessages([])
  }, [])

  return { messages, busy, send, stop, reset, model }
}
