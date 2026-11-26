import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// v1 stored starred coins under the bare `starred` key — carry them over.
function legacyStarred() {
  try {
    return JSON.parse(localStorage.getItem('starred')) ?? []
  } catch {
    return []
  }
}

export const useWatchlist = create(
  persist(
    (set, get) => ({
      ids: typeof localStorage !== 'undefined' ? legacyStarred() : [],
      toggle: (id) => {
        const has = get().ids.includes(id)
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] })
        return !has
      },
    }),
    { name: 'ch:watchlist' },
  ),
)
