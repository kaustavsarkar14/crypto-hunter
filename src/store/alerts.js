import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** alert: { id, coinId, symbol, name, image, direction: 'above'|'below', target, currency, createdAt, triggeredAt } */
export const useAlerts = create(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (a) =>
        set((s) => ({ alerts: [{ ...a, id: crypto.randomUUID(), createdAt: Date.now(), triggeredAt: null }, ...s.alerts] })),
      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      markTriggered: (id, price) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, triggeredAt: Date.now(), triggeredPrice: price } : a)),
        })),
      clearTriggered: () => set((s) => ({ alerts: s.alerts.filter((a) => !a.triggeredAt) })),
    }),
    { name: 'ch:alerts' },
  ),
)

export function shouldTrigger(alert, price) {
  if (alert.triggeredAt || price == null) return false
  return alert.direction === 'above' ? price >= alert.target : price <= alert.target
}
