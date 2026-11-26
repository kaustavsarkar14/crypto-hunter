import { motion } from 'motion/react'
import { memo } from 'react'
import { Link } from 'react-router'
import { formatCompact } from '../../lib/format'
import { softSpring } from '../../lib/motion'
import { useLiveQuote } from '../../hooks/useLiveQuote'
import { useSettings } from '../../store/settings'
import { ChangePill } from '../ui/ChangePill'
import { CoinLogo } from '../ui/CoinLogo'
import { PriceText } from '../ui/PriceText'
import { Sparkline } from '../ui/Sparkline'
import { StarButton } from './StarButton'

export const ROW_GRID =
  'grid grid-cols-[1fr_auto_auto] items-center gap-3 md:grid-cols-[2.5rem_1.6fr_1fr_6rem_8rem_1fr_2.5rem] md:gap-4'

export const CoinRow = memo(function CoinRow({ coin, index = 0 }) {
  const currency = useSettings((s) => s.currency)
  const { price, change24h } = useLiveQuote(coin)
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...softSpring, delay: Math.min(index, 15) * 0.02 }}
    >
      <div className={`${ROW_GRID} relative rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.06] md:px-4`}>
        <Link
          to={`/coin/${coin.id}`}
          viewTransition
          aria-label={`${coin.name} details`}
          className="absolute inset-0 rounded-2xl"
        />
        <span className="tabular hidden text-[13px] text-faint md:block">{coin.market_cap_rank}</span>
        <div className="flex min-w-0 items-center gap-3">
          <CoinLogo src={coin.image} id={coin.id} vt className="size-9" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{coin.name}</p>
            <p className="text-[12px] text-muted uppercase">{coin.symbol}</p>
          </div>
        </div>
        <PriceText value={price} currency={currency} className="text-right text-[15px] font-semibold" />
        <div className="flex justify-end">
          <ChangePill value={change24h} size="sm" />
        </div>
        <div className="hidden justify-end md:flex">
          <Sparkline data={coin.sparkline_in_7d?.price} width={110} height={32} />
        </div>
        <span className="tabular hidden text-right text-[14px] text-muted md:block">
          {formatCompact(coin.market_cap, currency)}
        </span>
        <div className="hidden justify-end md:flex">
          <StarButton coin={coin} className="relative" />
        </div>
      </div>
    </motion.li>
  )
})
