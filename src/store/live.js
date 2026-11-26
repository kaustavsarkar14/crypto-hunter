import { create } from 'zustand'

/** prices: { BTC: { price, open, high, low, time } } quoted in USDT */
export const useLive = create(() => ({ prices: {}, status: 'idle' }))
