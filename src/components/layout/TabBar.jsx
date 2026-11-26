import clsx from 'clsx'
import { motion } from 'motion/react'
import { NavLink } from 'react-router'
import { spring } from '../../lib/motion'
import { NAV } from './nav'

/** iOS-style floating tab bar for phones. */
export function TabBar() {
  const tabs = NAV.filter((n) => n.to !== '/watchlist')
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),10px)] lg:hidden">
      <ul className="glass-nav mx-auto flex max-w-md items-center justify-between rounded-full p-1.5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} viewTransition className="relative flex flex-col items-center gap-0.5 rounded-full py-1.5">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-full bg-white/[0.14] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                    />
                  )}
                  <motion.span animate={{ scale: isActive ? 1.08 : 1 }} transition={spring} className="relative">
                    <Icon className={clsx('size-[22px]', isActive ? 'text-accent' : 'text-muted')} strokeWidth={isActive ? 2.3 : 1.8} />
                  </motion.span>
                  <span className={clsx('relative text-[10px] font-medium', isActive ? 'text-ink' : 'text-muted')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
