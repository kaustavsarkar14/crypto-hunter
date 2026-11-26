import { useId, useMemo } from 'react'
import { downsample } from '../../lib/markets'

export function Sparkline({ data = [], width = 120, height = 40, className }) {
  const id = useId()
  const { line, area, up } = useMemo(() => {
    const pts = downsample(data, 48)
    if (pts.length < 2) return {}
    const min = Math.min(...pts)
    const max = Math.max(...pts)
    const span = max - min || 1
    const xy = pts.map((v, i) => [(i / (pts.length - 1)) * width, height - 2 - ((v - min) / span) * (height - 4)])
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
    return { line, area: `${line}L${width},${height}L0,${height}Z`, up: pts.at(-1) >= pts[0] }
  }, [data, width, height])

  if (!line) return <div style={{ width, height }} className={className} />
  const color = up ? 'var(--color-up)' : 'var(--color-down)'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
