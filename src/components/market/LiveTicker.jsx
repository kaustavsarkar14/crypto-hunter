import { Link } from 'react-router'
import { useMarkets } from '../../hooks/queries'
import { useLiveQuote } from '../../hooks/useLiveQuote'
import { useSettings } from '../../store/settings'
import { ChangePill } from '../ui/ChangePill'
import { CoinLogo } from '../ui/CoinLogo'
import { PriceText } from '../ui/PriceText'

function TickerItem({ coin }) {
  const currency = useSettings((s) => s.currency)
  const { price, change24h } = useLiveQuote(coin)
  return (
    <Link to={`/coin/${coin.id}`} viewTransition className="flex shrink-0 items-center gap-2.5 px-5">
      <CoinLogo src={coin.image} className="size-5" />
      <span className="text-[13px] font-semibold uppercase">{coin.symbol}</span>
      <PriceText value={price} currency={currency} className="text-[13px] text-muted" />
      <ChangePill value={change24h} size="sm" />
    </Link>
  )
}

/** Infinite marquee of live prices (duplicated once so the loop is seamless). */
export function LiveTicker({ count = 16 }) {
  const { data } = useMarkets()
  const coins = data?.slice(0, count) ?? []
  if (!coins.length) return <div className="h-11" />
  return (
    <div className="relative overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="marquee flex w-max">
        {[...coins, ...coins].map((c, i) => (
          <TickerItem key={`${c.id}-${i}`} coin={c} />
        ))}
      </div>
    </div>
  )
}
