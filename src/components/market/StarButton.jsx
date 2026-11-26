import clsx from 'clsx'
import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { bouncy } from '../../lib/motion'
import { useWatchlist } from '../../store/watchlist'

export function StarButton({ coin, className }) {
  const starred = useWatchlist((s) => s.ids.includes(coin.id))
  const toggle = useWatchlist((s) => s.toggle)
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      transition={bouncy}
      aria-pressed={starred}
      aria-label={starred ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
      onClick={(e) => {
        // Cards are links — don't navigate when starring.
        e.preventDefault()
        e.stopPropagation()
        const added = toggle(coin.id)
        toast(added ? `${coin.name} added to watchlist` : `${coin.name} removed from watchlist`)
      }}
      className={clsx(
        'grid size-9 place-items-center rounded-full transition-colors',
        starred ? 'text-orange' : 'text-faint hover:bg-white/10 hover:text-ink',
        className,
      )}
    >
      <motion.span key={String(starred)} initial={{ scale: 0.4, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={bouncy}>
        <Star className="size-[18px]" fill={starred ? 'currentColor' : 'none'} />
      </motion.span>
    </motion.button>
  )
}
