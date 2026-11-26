import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { Toaster } from 'sonner'
import { useAlertsEngine } from '../../hooks/useAlertsEngine'
import { startLiveFeed } from '../../lib/liveFeed'
import { CopilotLauncher } from '../copilot/CopilotLauncher'
import { Background } from './Background'
import { NavBar } from './NavBar'
import { TabBar } from './TabBar'

export function AppShell() {
  useEffect(() => startLiveFeed(), [])
  useAlertsEngine()

  return (
    // reducedMotion="user" turns spring/transform animations into fades for users who ask for less motion.
    <MotionConfig reducedMotion="user">
      <Background />
      <NavBar />
      <main className="vt-page mx-auto w-full max-w-[1180px] px-4 pt-28 pb-36 md:px-6 lg:pb-20">
        <Outlet />
      </main>
      <TabBar />
      <CopilotLauncher />
      {/* Toasts drop in from the top like a Dynamic Island notification */}
      <Toaster
        position="top-center"
        offset={18}
        toastOptions={{
          classNames: {
            toast:
              '!bg-black/85 !backdrop-blur-xl !text-ink !border !border-white/10 !rounded-[22px] !shadow-[0_20px_50px_-10px_rgb(0_0_0/0.8)] !px-5',
            description: '!text-muted',
          },
        }}
      />
      <ScrollRestoration />
    </MotionConfig>
  )
}
