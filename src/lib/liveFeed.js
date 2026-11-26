import { useLive } from '../store/live'
import { parseMiniTickers } from './live'

// Binance's market-data-only endpoint: public, no key, all USDT pairs once a second.
const URL = 'wss://data-stream.binance.vision/ws/!miniTicker@arr'

let ws = null
let started = false
let attempt = 0
let buffer = {}
let scheduled = false

/**
 * Ticks are buffered and flushed at most once per animation frame, so a burst
 * of 400 symbols becomes one store update. Components subscribe per symbol,
 * so only rows whose price actually changed re-render.
 * Hidden tabs don't run rAF, so fall back to a timer to keep alerts firing.
 */
function scheduleFlush() {
  if (scheduled) return
  scheduled = true
  const run = () => {
    scheduled = false
    const batch = buffer
    buffer = {}
    useLive.setState((s) => ({ prices: { ...s.prices, ...batch } }))
  }
  if (typeof document !== 'undefined' && document.hidden) setTimeout(run, 250)
  else requestAnimationFrame(run)
}

function connect() {
  useLive.setState({ status: attempt === 0 ? 'connecting' : 'reconnecting' })
  ws = new WebSocket(URL)
  ws.onopen = () => {
    attempt = 0
    useLive.setState({ status: 'live' })
  }
  ws.onmessage = (e) => {
    try {
      Object.assign(buffer, parseMiniTickers(JSON.parse(e.data)))
      scheduleFlush()
    } catch {
      /* ignore malformed frame */
    }
  }
  ws.onerror = () => ws?.close()
  ws.onclose = () => {
    useLive.setState({ status: 'offline' })
    // Exponential backoff with jitter: 1s, 2s, 4s … capped at 30s
    const delay = Math.min(30_000, 1000 * 2 ** attempt++) * (0.75 + Math.random() * 0.5)
    setTimeout(connect, delay)
  }
}

export function startLiveFeed() {
  if (started || typeof WebSocket === 'undefined') return
  started = true
  connect()
}
