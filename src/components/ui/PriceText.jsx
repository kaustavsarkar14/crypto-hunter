import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '../../lib/format'

/** Price that flashes green/red when a live tick moves it. */
export function PriceText({ value, currency, className }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState({ dir: null, n: 0 })

  useEffect(() => {
    const before = prev.current
    prev.current = value
    if (before == null || value == null || before === value) return
    setFlash((f) => ({ dir: value > before ? 'up' : 'down', n: f.n + 1 }))
  }, [value])

  return (
    <span key={flash.n} className={clsx('tabular inline-block', flash.dir && `flash-${flash.dir}`, className)}>
      {formatPrice(value, currency)}
    </span>
  )
}
