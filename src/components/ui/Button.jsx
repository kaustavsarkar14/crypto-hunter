import clsx from 'clsx'
import { motion } from 'motion/react'
import { spring } from '../../lib/motion'

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-[#3d9bff] to-accent text-white shadow-[0_8px_24px_-6px_rgb(10_132_255/0.6),inset_0_1px_0_rgb(255_255_255/0.35)]',
  glass: 'glass text-ink',
  ghost: 'text-muted hover:text-ink hover:bg-white/8',
  danger: 'bg-down/15 text-down hover:bg-down/25',
}
const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-[15px] gap-2',
  lg: 'h-12 px-6 text-[17px] gap-2',
  icon: 'h-10 w-10 justify-center',
  'icon-sm': 'h-8 w-8 justify-center',
}

export function Button({ variant = 'glass', size = 'md', className, children, ...rest }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={spring}
      className={clsx(
        'inline-flex shrink-0 items-center rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
