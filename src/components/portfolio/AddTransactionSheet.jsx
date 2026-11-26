import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRates } from '../../hooks/queries'
import { useLiveQuote } from '../../hooks/useLiveQuote'
import { usePortfolio } from '../../store/portfolio'
import { CoinPicker } from '../market/CoinPicker'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Sheet } from '../ui/Sheet'

const today = () => new Date().toISOString().slice(0, 10)

export function AddTransactionSheet({ open, onOpenChange, initialCoin }) {
  const addTx = usePortfolio((s) => s.addTx)
  const { currency, usdToCur } = useRates()
  const [coin, setCoin] = useState(initialCoin ?? null)
  const [type, setType] = useState('buy')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(today())
  const quote = useLiveQuote(coin)

  useEffect(() => {
    if (open) {
      setCoin(initialCoin ?? null)
      setQty('')
      setDate(today())
    }
  }, [open, initialCoin])

  // Prefill the current price whenever the coin changes
  useEffect(() => {
    if (coin && quote.price != null) setPrice(String(+quote.price.toPrecision(8)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin?.id])

  const q = parseFloat(qty)
  const p = parseFloat(price)
  const valid = coin && q > 0 && p > 0 && usdToCur

  const save = () => {
    if (!valid) return
    // Store cost in USD so switching display currency never rewrites history.
    addTx({ coinId: coin.id, type, qty: q, priceUsd: p / usdToCur, date })
    toast.success(`${type === 'buy' ? 'Bought' : 'Sold'} ${q} ${coin.symbol.toUpperCase()}`)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Add transaction">
      <div className="space-y-5">
        <SegmentedControl
          label="Type"
          className="w-full [&>button]:flex-1"
          value={type}
          onChange={setType}
          options={[
            { value: 'buy', label: 'Buy' },
            { value: 'sell', label: 'Sell' },
          ]}
        />
        <CoinPicker coin={coin} onChange={setCoin} nested />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input inputMode="decimal" type="number" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0.00" className={inputClass} />
          </Field>
          <Field label={`Price per coin (${currency})`}>
            <input inputMode="decimal" type="number" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={inputClass} />
          </Field>
        </div>
        <Field label="Date">
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <Button variant="primary" size="lg" className="w-full justify-center" disabled={!valid} onClick={save}>
          Add {type}
        </Button>
      </div>
    </Sheet>
  )
}
