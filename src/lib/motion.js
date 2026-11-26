// Shared spring presets — tuned to feel like UIKit's default springs.
export const spring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }
export const softSpring = { type: 'spring', stiffness: 260, damping: 30 }
export const bouncy = { type: 'spring', stiffness: 520, damping: 22 }

export const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: softSpring },
}

export const stagger = (step = 0.05, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})
