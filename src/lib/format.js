export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP']

const LOCALE = { USD: 'en-US', INR: 'en-IN', EUR: 'en-IE', GBP: 'en-GB' }
const cache = new Map()

function formatter(key, locale, options) {
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, options)
    cache.set(key, f)
  }
  return f
}

/** Price with precision that adapts to magnitude: $64,210.55 · $0.4821 · $0.00002315 */
export function formatPrice(value, currency = 'USD') {
  if (value == null || !Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const locale = LOCALE[currency] ?? 'en-US'
  const base = { style: 'currency', currency }
  if (abs >= 1) {
    return formatter(`p2:${currency}`, locale, { ...base, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }
  if (abs >= 0.01) {
    return formatter(`p4:${currency}`, locale, { ...base, minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value)
  }
  return formatter(`ps:${currency}`, locale, { ...base, maximumSignificantDigits: 4 }).format(value)
}

/** Compact money: $1.27T · ₹8.4L Cr style handled by Intl compact */
export function formatCompact(value, currency = 'USD') {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatter(`c:${currency}`, LOCALE[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value, maximumFractionDigits = 2) {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatter(`n:${maximumFractionDigits}`, 'en-US', { maximumFractionDigits }).format(value)
}

export function formatCompactNumber(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatter('cn', 'en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function formatPercent(value, { signed = true } = {}) {
  if (value == null || !Number.isFinite(value)) return '—'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+\n/g, '\n').trim()
}
