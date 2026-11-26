import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatPercent } from '../../lib/format'

export function ChangePill({ value, className, size = 'md' }) {
  if (value == null) return <span className="text-faint">—</span>
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={clsx(
        'tabular inline-flex items-center gap-0.5 rounded-full font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-[13px]',
        up ? 'bg-up/15 text-up' : 'bg-down/15 text-down',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} strokeWidth={2.5} />
      {formatPercent(Math.abs(value), { signed: false })}
    </span>
  )
}
