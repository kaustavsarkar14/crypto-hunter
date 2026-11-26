import { motion } from 'motion/react'
import { fadeUp } from '../../lib/motion'
import { Glass } from './Glass'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <Glass className="mx-auto flex max-w-md flex-col items-center gap-3 px-8 py-12 text-center">
        {Icon && (
          <div className="mb-1 grid size-14 place-items-center rounded-2xl bg-white/[0.08] ring-1 ring-white/10">
            <Icon className="size-6 text-muted" />
          </div>
        )}
        <h3 className="text-[19px] font-semibold">{title}</h3>
        {description && <p className="text-[15px] text-muted">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </Glass>
    </motion.div>
  )
}
