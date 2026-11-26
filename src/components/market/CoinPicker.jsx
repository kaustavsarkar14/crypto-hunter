import { ChevronDown, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useDeferredValue, useMemo, useState } from 'react'
import { useMarkets } from '../../hooks/queries'
import { selectCoins } from '../../lib/markets'
import { spring } from '../../lib/motion'
import { CoinLogo } from '../ui/CoinLogo'
import { inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'

export function CoinList({ onPick, exclude = [] }) {
  const { data = [] } = useMarkets()
  const [query, setQuery] = useState('')
  const q = useDeferredValue(query)
  const coins = useMemo(
    () => selectCoins(data, { query: q }).filter((c) => !exclude.includes(c.id)).slice(0, 60),
    [data, q, exclude],
  )
  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coins"
          className={`${inputClass} pl-11`}
        />
      </div>
      <ul className="-mx-2">
        {coins.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onPick(c)}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-white/[0.07]"
            >
              <CoinLogo src={c.image} className="size-8" />
              <span className="flex-1 truncate text-[15px] font-medium">{c.name}</span>
              <span className="text-[13px] text-muted uppercase">{c.symbol}</span>
            </button>
          </li>
        ))}
        {coins.length === 0 && <li className="py-8 text-center text-muted">No coins match “{query}”</li>}
      </ul>
    </div>
  )
}

/** Button that opens a searchable bottom sheet of coins. */
export function CoinPicker({ coin, onChange, exclude, label = 'Choose coin', nested = false }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        transition={spring}
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center gap-3 rounded-2xl bg-white/[0.07] px-3 text-left ring-1 ring-white/10 ring-inset hover:bg-white/[0.1]"
      >
        {coin ? (
          <>
            <CoinLogo src={coin.image} className="size-9" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{coin.name}</span>
              <span className="block text-[12px] text-muted uppercase">{coin.symbol}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 pl-1 text-muted">{label}</span>
        )}
        <ChevronDown className="size-4 text-muted" />
      </motion.button>
      <Sheet open={open} onOpenChange={setOpen} title={label} nested={nested}>
        <CoinList
          exclude={exclude}
          onPick={(c) => {
            onChange(c)
            setOpen(false)
          }}
        />
      </Sheet>
    </>
  )
}
