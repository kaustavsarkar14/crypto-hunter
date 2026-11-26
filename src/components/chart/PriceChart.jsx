import { AreaSeries, CandlestickSeries, createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import { useChart } from '../../hooks/queries'
import { formatPrice } from '../../lib/format'
import { Skeleton } from '../ui/Skeleton'
import { baseOptions, toSeries } from './theme'

const UP = '#30d158'
const DOWN = '#ff453a'

/** Area or candlestick chart that also streams the live price into the last bar. */
export function PriceChart({ coinId, days, kind, currency, livePrice, height = 340 }) {
  const { data, isLoading, isFetching } = useChart(coinId, days, kind)
  const box = useRef(null)
  const chart = useRef(null)
  const series = useRef(null)
  const lastBar = useRef(null)

  // Build the chart (re-created when the series kind changes)
  useEffect(() => {
    const c = createChart(box.current, baseOptions({ timeVisible: days <= 7, priceFormatter: (p) => formatPrice(p, currency) }))
    chart.current = c
    series.current =
      kind === 'candles'
        ? c.addSeries(CandlestickSeries, {
            upColor: UP,
            downColor: DOWN,
            wickUpColor: UP,
            wickDownColor: DOWN,
            borderVisible: false,
          })
        : c.addSeries(AreaSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
    return () => {
      c.remove()
      chart.current = series.current = null
    }
  }, [kind, days, currency])

  // Feed data
  useEffect(() => {
    if (!data || !series.current) return
    let points
    if (kind === 'candles') {
      points = toSeries(data, ([, open, high, low, close]) => ({ open, high, low, close }))
    } else {
      points = toSeries(data.prices, ([, value]) => ({ value }))
      const up = points.length > 1 && points.at(-1).value >= points[0].value
      const color = up ? UP : DOWN
      series.current.applyOptions({
        lineColor: color,
        topColor: up ? 'rgba(48,209,88,0.32)' : 'rgba(255,69,58,0.32)',
        bottomColor: 'rgba(0,0,0,0)',
        crosshairMarkerBackgroundColor: color,
      })
    }
    series.current.setData(points)
    lastBar.current = points.at(-1) ?? null
    chart.current.timeScale().fitContent()
    // Re-run when the chart is rebuilt (days/currency) even if `data` is the cached object.
  }, [data, kind, days, currency])

  // Stream live ticks into the newest bar
  useEffect(() => {
    const bar = lastBar.current
    if (!bar || livePrice == null || !series.current) return
    const now = Math.floor(Date.now() / 1000)
    try {
      if (kind === 'candles') {
        series.current.update({
          ...bar,
          high: Math.max(bar.high, livePrice),
          low: Math.min(bar.low, livePrice),
          close: livePrice,
        })
      } else {
        series.current.update({ time: Math.max(now, bar.time), value: livePrice })
      }
    } catch {
      /* out-of-order tick while data is refetching */
    }
  }, [livePrice, kind])

  return (
    <div className="relative" style={{ height }}>
      <div ref={box} className={`absolute inset-0 transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60' : ''}`} />
      {isLoading && <Skeleton className="absolute inset-0 rounded-2xl" />}
    </div>
  )
}
