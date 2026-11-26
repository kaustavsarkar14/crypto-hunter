import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useLiveQuote } from '../../hooks/useLiveQuote'
import { formatPrice } from '../../lib/format'
import { useAlerts } from '../../store/alerts'
import { useSettings } from '../../store/settings'
import { CoinPicker } from '../market/CoinPicker'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Sheet } from '../ui/Sheet'

async function ensureNotificationPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return
  try {
    await Notification.requestPermission()
  } catch {
    /* Safari < 16 */
  }
}

export function AlertSheet({ open, onOpenChange, initialCoin }) {
  const currency = useSettings((s) => s.currency)
  const addAlert = useAlerts((s) => s.addAlert)
  const [coin, setCoin] = useState(initialCoin ?? null)
  const [direction, setDirection] = useState('above')
  const [target, setTarget] = useState('')
  const { price } = useLiveQuote(coin)

  useEffect(() => {
    if (open) {
      setCoin(initialCoin ?? null)
      setTarget('')
    }
  }, [open, initialCoin])

  const value = parseFloat(target)
  const valid = coin && Number.isFinite(value) && value > 0

  const save = async () => {
    if (!valid) return
    await ensureNotificationPermission()
    addAlert({ coinId: coin.id, symbol: coin.symbol, name: coin.name, image: coin.image, direction, target: value, currency })
    toast.success(`Alert set for ${coin.name}`, { description: `When price goes ${direction} ${formatPrice(value, currency)}` })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New price alert" description="We'll notify you the moment it crosses.">
      <div className="space-y-5">
        <CoinPicker coin={coin} onChange={setCoin} nested />
        <div className="flex items-center justify-between">
          <SegmentedControl
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'above', label: 'Goes above' },
              { value: 'below', label: 'Goes below' },
            ]}
          />
          {price != null && (
            <button type="button" className="text-[13px] text-accent" onClick={() => setTarget(String(+price.toPrecision(6)))}>
              Now {formatPrice(price, currency)}
            </button>
          )}
        </div>
        <Field label={`Target price (${currency})`}>
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Button variant="primary" size="lg" className="w-full justify-center" disabled={!valid} onClick={save}>
          Create alert
        </Button>
      </div>
    </Sheet>
  )
}
