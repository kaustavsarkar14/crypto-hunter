import clsx from 'clsx'
import { useLive } from '../../store/live'

const LABEL = { live: 'Live', connecting: 'Connecting', reconnecting: 'Reconnecting', offline: 'Offline', idle: '' }

export function LiveStatus({ className }) {
  const status = useLive((s) => s.status)
  const live = status === 'live'
  return (
    <span
      title={live ? 'Streaming prices from Binance' : 'Live prices unavailable — showing CoinGecko snapshot'}
      className={clsx('inline-flex items-center gap-1.5 text-[12px] font-medium', live ? 'text-up' : 'text-faint', className)}
    >
      <span className="relative flex size-2">
        {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60" />}
        <span className={clsx('relative inline-flex size-2 rounded-full', live ? 'bg-up' : 'bg-faint')} />
      </span>
      {LABEL[status]}
    </span>
  )
}
