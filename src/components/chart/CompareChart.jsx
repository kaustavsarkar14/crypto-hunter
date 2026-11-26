import { LineSeries, createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import { useCharts } from '../../hooks/queries'
import { Skeleton } from '../ui/Skeleton'
import { SERIES_COLORS, baseOptions, toSeries } from './theme'

/**
 * Performance chart: every coin rebased to % change from the start of the
 * window, so coins with very different prices share one honest axis
 * (v1 used two y-axes, which visually exaggerates whichever moves less).
 */
export function CompareChart({ coinIds, days, height = 320 }) {
  const results = useCharts(coinIds, days)
  const box = useRef(null)
  const chart = useRef(null)
  const loading = results.some((r) => r.isLoading)
  const datasets = results.map((r) => r.data)

  useEffect(() => {
    const c = createChart(box.current, {
      ...baseOptions({ timeVisible: days <= 7 }),
      localization: { priceFormatter: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
    })
    chart.current = c
    return () => {
      c.remove()
      chart.current = null
    }
  }, [days])

  useEffect(() => {
    const c = chart.current
    if (!c || datasets.some((d) => !d)) return
    const created = datasets.map((d, i) => {
      const s = c.addSeries(LineSeries, {
        color: SERIES_COLORS[i % SERIES_COLORS.length],
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      })
      const first = d.prices?.[0]?.[1]
      s.setData(toSeries(d.prices, ([, v]) => ({ value: first ? ((v - first) / first) * 100 : 0 })))
      return s
    })
    c.timeScale().fitContent()
    return () => {
      for (const s of created) {
        try {
          c.removeSeries(s)
        } catch {
          /* chart already removed */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...datasets, days])

  return (
    <div className="relative" style={{ height }}>
      <div ref={box} className="absolute inset-0" />
      {loading && <Skeleton className="absolute inset-0 rounded-2xl" />}
    </div>
  )
}
