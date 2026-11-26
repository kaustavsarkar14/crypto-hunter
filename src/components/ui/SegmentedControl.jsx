import clsx from 'clsx'
import { motion } from 'motion/react'
import { useId } from 'react'
import { spring } from '../../lib/motion'

/** iOS segmented control with a spring-animated sliding thumb. */
export function SegmentedControl({ options, value, onChange, size = 'md', className, label }) {
  const id = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx('relative inline-flex rounded-full bg-white/[0.07] p-1 ring-1 ring-white/10 ring-inset', className)}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-300',
              size === 'sm' ? 'h-7 px-3 text-[12px]' : 'h-8 px-3.5 text-[13px]',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className="absolute inset-0 -z-10 rounded-full bg-white/[0.16] shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_12px_rgb(0_0_0/0.3)]"
              />
            )}
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
