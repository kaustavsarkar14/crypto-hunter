import { Bell, BellRing, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AlertSheet } from '../components/alerts/AlertSheet'
import { Button } from '../components/ui/Button'
import { CoinLogo } from '../components/ui/CoinLogo'
import { EmptyState } from '../components/ui/EmptyState'
import { Glass } from '../components/ui/Glass'
import { LargeTitle } from '../components/ui/LargeTitle'
import { PriceText } from '../components/ui/PriceText'
import { useMarketMap } from '../hooks/queries'
import { useLiveQuote } from '../hooks/useLiveQuote'
import { formatPrice } from '../lib/format'
import { softSpring } from '../lib/motion'
import { useAlerts } from '../store/alerts'
import { useSettings } from '../store/settings'

function AlertRow({ alert }) {
  const removeAlert = useAlerts((s) => s.removeAlert)
  const markets = useMarketMap()
  const currency = useSettings((s) => s.currency)
  const { price } = useLiveQuote(markets?.get(alert.coinId))
  const sameCurrency = currency === alert.currency
  const distance = sameCurrency && price ? ((alert.target - price) / price) * 100 : null

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      transition={softSpring}
      className="flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 hover:bg-white/[0.04]"
    >
      <CoinLogo src={alert.image} className="size-10" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {alert.name}{' '}
          <span className="font-normal text-muted">
            {alert.direction} {formatPrice(alert.target, alert.currency)}
          </span>
        </p>
        <p className="text-[13px] text-faint">
          {alert.triggeredAt ? (
            <>Triggered {new Date(alert.triggeredAt).toLocaleString()} at {formatPrice(alert.triggeredPrice, alert.currency)}</>
          ) : (
            <>
              Now <PriceText value={price} currency={currency} className="text-muted" />
              {distance != null && <span className="ml-1.5">({Math.abs(distance).toFixed(2)}% away)</span>}
            </>
          )}
        </p>
      </div>
      {alert.triggeredAt ? <BellRing className="size-5 text-orange" /> : <span className="size-2 rounded-full bg-up" title="Active" />}
      <button
        onClick={() => removeAlert(alert.id)}
        aria-label="Delete alert"
        className="grid size-9 place-items-center rounded-full text-faint hover:bg-down/15 hover:text-down"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.li>
  )
}

export default function Alerts() {
  const alerts = useAlerts((s) => s.alerts)
  const clearTriggered = useAlerts((s) => s.clearTriggered)
  const [open, setOpen] = useState(false)
  const active = alerts.filter((a) => !a.triggeredAt)
  const fired = alerts.filter((a) => a.triggeredAt)
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'

  return (
    <div>
      <LargeTitle
        title="Alerts"
        subtitle="Checked against every live tick while Crypto Hunter is open."
        trailing={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New alert
          </Button>
        }
      />
      {permission === 'default' && alerts.length > 0 && (
        <Glass className="mb-4 flex items-center justify-between gap-4 p-4">
          <p className="text-[14px] text-muted">Turn on notifications to get alerts when this tab is in the background.</p>
          <Button size="sm" onClick={() => Notification.requestPermission()}>
            Enable
          </Button>
        </Glass>
      )}
      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Pick a coin and a target price. You'll get a notification the moment it crosses."
          action={<Button onClick={() => setOpen(true)}>Create an alert</Button>}
        />
      ) : (
        <div className="space-y-4">
          <Glass className="p-2">
            <h2 className="px-4 pt-3 pb-1 text-[17px] font-semibold">Active · {active.length}</h2>
            <ul>
              <AnimatePresence initial={false}>
                {active.map((a) => (
                  <AlertRow key={a.id} alert={a} />
                ))}
              </AnimatePresence>
            </ul>
            {active.length === 0 && <p className="px-4 pb-4 text-[14px] text-faint">No active alerts.</p>}
          </Glass>
          {fired.length > 0 && (
            <Glass className="p-2">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <h2 className="text-[17px] font-semibold">Triggered</h2>
                <Button size="sm" variant="ghost" onClick={clearTriggered}>
                  Clear
                </Button>
              </div>
              <ul>
                <AnimatePresence initial={false}>
                  {fired.map((a) => (
                    <AlertRow key={a.id} alert={a} />
                  ))}
                </AnimatePresence>
              </ul>
            </Glass>
          )}
        </div>
      )}
      <AlertSheet open={open} onOpenChange={setOpen} />
    </div>
  )
}
