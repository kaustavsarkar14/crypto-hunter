import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettings = create(
  persist(
    (set) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'ch:settings' },
  ),
)
