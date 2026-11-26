import { Star } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { CoinCard } from '../components/market/CoinCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LargeTitle } from '../components/ui/LargeTitle'
import { Skeleton } from '../components/ui/Skeleton'
import { useMarketMap } from '../hooks/queries'
import { softSpring } from '../lib/motion'
import { useWatchlist } from '../store/watchlist'

export default function Watchlist() {
  const ids = useWatchlist((s) => s.ids)
  const markets = useMarketMap()
  const coins = ids.map((id) => markets?.get(id)).filter(Boolean)

  return (
    <div>
      <LargeTitle title="Watchlist" subtitle={`${ids.length} starred coin${ids.length === 1 ? '' : 's'}`} />
      {!markets ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ids.slice(0, 6).map((id) => (
            <Skeleton key={id} className="h-[214px] rounded-[28px]" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nothing starred yet"
          description="Tap the star on any coin to keep an eye on it here."
          action={
            <Link to="/markets" viewTransition className="text-[15px] font-medium text-accent">
              Browse markets →
            </Link>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {coins.map((c, i) => (
              <motion.div key={c.id} layout exit={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }} transition={softSpring}>
                <CoinCard coin={c} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
