import { motion } from 'motion/react'
import { softSpring } from '../../lib/motion'

/** iOS "large title" page header. */
export function LargeTitle({ title, subtitle, trailing }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={softSpring}
      >
        <h1 className="text-[34px] leading-tight font-bold tracking-[-0.03em] md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </motion.div>
      {trailing}
    </div>
  )
}
