import { motion } from 'motion/react'
import { memo } from 'react'
import { Link } from 'react-router'
import { formatCompact } from '../../lib/format'
import { softSpring } from '../../lib/motion'
import { useLiveQuote } from '../../hooks/useLiveQuote'
import { useSettings } from '../../store/settings'
import { ChangePill } from '../ui/ChangePill'
import { CoinLogo } from '../ui/CoinLogo'
import { Glass } from '../ui/Glass'
import { PriceText } from '../ui/PriceText'
import { Sparkline } from '../ui/Sparkline'
import { StarButton } from './StarButton'

export const CoinCard = memo(function CoinCard({ coin, index = 0 }) {
  const currency = useSettings((s) => s.currency)
  const { price, change24h, live } = useLiveQuote(coin)
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...softSpring, delay: Math.min(index, 12) * 0.03 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Glass interactive className="relative p-5">
        {/* Overlay link keeps the star button out of the <a> (no nested interactive content). */}
        <Link
          to={`/coin/${coin.id}`}
          viewTransition
          aria-label={`${coin.name} details`}
          className="absolute inset-0 z-0 rounded-[28px]"
        />
        <div className="pointer-events-none relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CoinLogo src={coin.image} id={coin.id} vt className="size-11" />
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold">{coin.name}</p>
                <p className="text-[13px] text-muted uppercase">
                  {coin.symbol}
                  <span className="ml-2 text-faint">#{coin.market_cap_rank}</span>
                </p>
              </div>
            </div>
            <StarButton coin={coin} className="pointer-events-auto -mt-1 -mr-2" />
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PriceText value={price} currency={currency} className="text-[24px] font-semibold tracking-tight" />
                {live && <span className="size-1.5 rounded-full bg-up shadow-[0_0_8px_var(--color-up)]" title="Live" />}
              </div>
              <ChangePill value={change24h} className="mt-1.5" />
            </div>
            <Sparkline data={coin.sparkline_in_7d?.price} width={110} height={44} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-hairline pt-4 text-[12px]">
            <div>
              <p className="text-faint">Market cap</p>
              <p className="tabular mt-0.5 text-[14px] font-medium">{formatCompact(coin.market_cap, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-faint">Volume 24h</p>
              <p className="tabular mt-0.5 text-[14px] font-medium">{formatCompact(coin.total_volume, currency)}</p>
            </div>
          </div>
        </div>
      </Glass>
    </motion.div>
  )
})
