import clsx from 'clsx'
import { Star } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { spring } from '../../lib/motion'
import { CurrencyMenu } from './CurrencyMenu'
import { LiveStatus } from './LiveStatus'
import { NAV } from './nav'

export function Logo() {
  return (
    <Link to="/" viewTransition className="flex items-center gap-2 pr-1" aria-label="Crypto Hunter home">
      <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-accent to-violet shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_6px_16px_-4px_rgb(10_132_255/0.7)]">
        <svg viewBox="0 0 24 24" className="size-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l5-5 4 4 8-9" />
          <path d="M15 7h5v5" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">
        Crypto<span className="text-muted">Hunter</span>
      </span>
    </Link>
  )
}

/** Floating glass pill that tightens as you scroll (desktop); slim header on mobile. */
export function NavBar() {
  const { scrollY } = useScroll()
  const [compact, setCompact] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 24))

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(env(safe-area-inset-top),12px)]">
      {/* Content fades out as it scrolls under the bar (like iOS large-title navigation) */}
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-canvas via-canvas/70 to-transparent transition-opacity duration-500',
          compact ? 'opacity-100' : 'opacity-0',
        )}
      />
      <motion.nav
        animate={{ maxWidth: compact ? 1040 : 1180, y: compact ? -2 : 0 }}
        transition={spring}
        className={clsx(
          'glass-nav flex h-14 w-full items-center justify-between gap-2 rounded-full pr-2 pl-3',
          compact && '!bg-[rgb(10_11_18/0.62)] shadow-[0_18px_44px_-12px_rgb(0_0_0/0.8)]',
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} viewTransition className="relative block rounded-full px-3.5 py-1.5 text-[14px] font-medium">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={spring}
                        className="absolute inset-0 rounded-full bg-white/[0.14] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                      />
                    )}
                    <span className={clsx('relative transition-colors', isActive ? 'text-ink' : 'text-muted hover:text-ink')}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <LiveStatus className="hidden sm:inline-flex" />
          <NavLink
            to="/watchlist"
            viewTransition
            aria-label="Watchlist"
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-ink lg:hidden"
          >
            <Star className="size-[18px]" />
          </NavLink>
          <CurrencyMenu />
        </div>
      </motion.nav>
    </header>
  )
}
