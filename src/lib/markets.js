export const SORTS = {
  rank: { label: 'Market cap', short: 'Market cap', fn: (a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9) },
  'price-desc': { label: 'Price: high → low', short: 'Price ↓', fn: (a, b) => b.current_price - a.current_price },
  'price-asc': { label: 'Price: low → high', short: 'Price ↑', fn: (a, b) => a.current_price - b.current_price },
  'change-desc': { label: 'Top gainers (24h)', short: 'Gainers', fn: (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0) },
  'change-asc': { label: 'Top losers (24h)', short: 'Losers', fn: (a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0) },
  volume: { label: 'Volume (24h)', short: 'Volume', fn: (a, b) => b.total_volume - a.total_volume },
  'name-asc': { label: 'Name A → Z', short: 'A → Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

/**
 * Pure selector: never mutates `coins` (the v1 app sorted React state in place,
 * which caused stale renders).
 */
export function selectCoins(coins = [], { query = '', sort = 'rank', filter = 'all', watchIds = [] } = {}) {
  const q = query.trim().toLowerCase()
  const watch = new Set(watchIds)
  const out = coins.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q) && !c.symbol.toLowerCase().includes(q)) return false
    if (filter === 'gainers') return (c.price_change_percentage_24h ?? 0) > 0
    if (filter === 'losers') return (c.price_change_percentage_24h ?? 0) < 0
    if (filter === 'starred') return watch.has(c.id)
    return true
  })
  return out.sort((SORTS[sort] ?? SORTS.rank).fn)
}

/** Evenly downsample a series to at most `max` points (keeps first + last). */
export function downsample(points = [], max = 40) {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)])
}

const MONEY_FIELDS = ['current_price', 'market_cap', 'total_volume', 'high_24h', 'low_24h', 'ath', 'atl', 'fully_diluted_valuation']

/**
 * Re-denominate market rows by an FX factor. Used as placeholder data while the
 * new currency loads, so switching USD → INR is instant and never shows dollar
 * amounts with a rupee sign.
 */
export function convertMarkets(rows, factor) {
  if (!rows || !Number.isFinite(factor)) return undefined
  return rows.map((c) => {
    const out = { ...c }
    for (const f of MONEY_FIELDS) if (typeof c[f] === 'number') out[f] = c[f] * factor
    if (c.sparkline_in_7d?.price) out.sparkline_in_7d = { price: c.sparkline_in_7d.price.map((p) => p * factor) }
    return out
  })
}
