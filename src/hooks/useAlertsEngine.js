import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAlerts, shouldTrigger } from '../store/alerts'
import { useLive } from '../store/live'
import { useFx, useMarketMap } from './queries'
import { quoteFor } from './useLiveQuote'
import { formatPrice } from '../lib/format'

/**
 * Checks every active alert against each live price batch. Runs outside React
 * renders via store.subscribe, so it costs nothing when there are no alerts.
 * Notifications fire while the app is open (including background tabs).
 */
export function useAlertsEngine() {
  const markets = useMarketMap()
  const { data: fx } = useFx()
  const ctx = useRef({ markets, fx })
  ctx.current = { markets, fx }

  useEffect(() => {
    return useLive.subscribe(({ prices }) => {
      const { markets, fx } = ctx.current
      if (!markets || !fx?.tether) return
      const { alerts, markTriggered } = useAlerts.getState()
      for (const alert of alerts) {
        if (alert.triggeredAt) continue
        const coin = markets.get(alert.coinId)
        const rate = fx.tether[alert.currency.toLowerCase()]
        const { price, live } = quoteFor(coin, prices, rate)
        if (!live || !shouldTrigger(alert, price)) continue
        markTriggered(alert.id, price)
        const title = `${alert.name} is ${alert.direction} ${formatPrice(alert.target, alert.currency)}`
        const body = `Now trading at ${formatPrice(price, alert.currency)}`
        toast.success(title, { description: body })
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon: alert.image, tag: alert.id })
        }
      }
    })
  }, [])
}
