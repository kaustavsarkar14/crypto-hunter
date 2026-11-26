import clsx from 'clsx'
import { Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { spring } from '../../lib/motion'

/** Glass popover menu (iOS context-menu style). */
export function Menu({ value, options, onChange, label, align = 'right', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        transition={spring}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-full bg-white/[0.07] pr-2.5 pl-3.5 text-[13px] font-medium text-ink ring-1 ring-white/10 ring-inset hover:bg-white/[0.11]"
      >
        {current?.short ?? current?.label}
        <ChevronDown className={clsx('size-3.5 text-muted transition-transform duration-300', open && 'rotate-180')} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, scale: 0.9, y: -6, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -4, filter: 'blur(6px)' }}
            transition={spring}
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            className={clsx(
              'glass-strong absolute top-11 z-50 min-w-48 overflow-hidden rounded-2xl p-1.5',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((o) => (
              <li key={o.value}>
                <button
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2 text-left text-[14px] hover:bg-white/10"
                >
                  {o.label}
                  {o.value === value && <Check className="size-4 text-accent" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
