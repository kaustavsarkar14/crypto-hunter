const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'narrow' })
const STEPS = [
  [60, 'second'],
  [60, 'minute'],
  [24, 'hour'],
  [7, 'day'],
  [4.35, 'week'],
  [12, 'month'],
]

/** "5m ago", "2h ago", "yesterday" */
export function timeAgo(date, now = Date.now()) {
  const t = new Date(date).getTime()
  if (!Number.isFinite(t)) return ''
  let value = (t - now) / 1000
  for (const [size, unit] of STEPS) {
    if (Math.abs(value) < size) return unit === 'second' ? 'just now' : rtf.format(Math.round(value), unit)
    value /= size
  }
  return rtf.format(Math.round(value), 'year')
}
