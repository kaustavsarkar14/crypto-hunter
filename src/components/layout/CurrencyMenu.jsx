import { CURRENCIES } from '../../lib/format'
import { useSettings } from '../../store/settings'
import { Menu } from '../ui/Menu'

const NAMES = { USD: 'US Dollar', INR: 'Indian Rupee', EUR: 'Euro', GBP: 'British Pound' }
const SYMBOL = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }

export function CurrencyMenu({ align }) {
  const { currency, setCurrency } = useSettings()
  return (
    <Menu
      label="Display currency"
      align={align}
      value={currency}
      onChange={setCurrency}
      options={CURRENCIES.map((c) => ({ value: c, short: `${SYMBOL[c]} ${c}`, label: `${SYMBOL[c]}  ${NAMES[c]}` }))}
    />
  )
}
