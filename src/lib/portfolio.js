/**
 * Average-cost accounting. All money values are stored in USD so the user can
 * switch display currency without corrupting their cost basis.
 * tx: { id, coinId, type: 'buy' | 'sell', qty, priceUsd, date }
 */
export function computeHoldings(txs = []) {
  const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date))
  const map = new Map()
  for (const tx of sorted) {
    const h = map.get(tx.coinId) ?? { coinId: tx.coinId, qty: 0, costUsd: 0, realizedUsd: 0 }
    if (tx.type === 'buy') {
      h.qty += tx.qty
      h.costUsd += tx.qty * tx.priceUsd
    } else {
      const qty = Math.min(tx.qty, h.qty)
      const avg = h.qty > 0 ? h.costUsd / h.qty : 0
      h.realizedUsd += qty * (tx.priceUsd - avg)
      h.costUsd -= qty * avg
      h.qty -= qty
    }
    map.set(tx.coinId, h)
  }
  return [...map.values()]
    .map((h) => ({ ...h, avgCostUsd: h.qty > 0 ? h.costUsd / h.qty : 0 }))
    .filter((h) => h.qty > 1e-12 || h.realizedUsd !== 0)
}

/** Value holdings at current prices (in display currency). */
export function valueHoldings(holdings, priceOf, usdToCur) {
  const rows = holdings
    .filter((h) => h.qty > 1e-12)
    .map((h) => {
      const price = priceOf(h.coinId)
      const value = price != null ? h.qty * price : null
      const cost = h.costUsd * usdToCur
      const pnl = value != null ? value - cost : null
      return { ...h, price, value, cost, pnl, pnlPct: cost > 0 && pnl != null ? (pnl / cost) * 100 : null }
    })
  const totalValue = rows.reduce((s, r) => s + (r.value ?? 0), 0)
  const totalCost = rows.reduce((s, r) => s + r.cost, 0)
  const withWeight = rows
    .map((r) => ({ ...r, weight: totalValue > 0 ? (r.value ?? 0) / totalValue : 0 }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  return {
    rows: withWeight,
    totalValue,
    totalCost,
    totalPnl: totalValue - totalCost,
    totalPnlPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
  }
}
