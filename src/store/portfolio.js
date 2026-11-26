import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePortfolio = create(
  persist(
    (set) => ({
      txs: [],
      addTx: (tx) => set((s) => ({ txs: [...s.txs, { ...tx, id: crypto.randomUUID() }] })),
      removeTx: (id) => set((s) => ({ txs: s.txs.filter((t) => t.id !== id) })),
    }),
    { name: 'ch:portfolio' },
  ),
)
