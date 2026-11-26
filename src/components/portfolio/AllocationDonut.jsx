import { motion } from 'motion/react'
import { softSpring } from '../../lib/motion'

const COLORS = ['#0a84ff', '#bf5af2', '#30d158', '#ff9f0a', '#64d2ff', '#ff375f', '#ffd60a', '#ac8e68']

export function allocationColor(i) {
  return COLORS[i % COLORS.length]
}

/** Animated donut; each arc draws in with a spring. */
export function AllocationDonut({ rows, size = 180, stroke = 22, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const gap = rows.length > 1 ? 4 : 0
  let offset = 0
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth={stroke} />
        {rows.map((row, i) => {
          const len = Math.max(0, row.weight * c - gap)
          const dash = (
            <motion.circle
              key={row.coinId}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={allocationColor(i)}
              strokeWidth={stroke}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: `${len} ${c - len}` }}
              transition={{ ...softSpring, delay: 0.1 + i * 0.06 }}
              strokeDashoffset={-offset}
            />
          )
          offset += row.weight * c
          return dash
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
