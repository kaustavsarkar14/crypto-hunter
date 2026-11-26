import { create } from 'zustand'

export const useUI = create((set) => ({
  copilotOpen: false,
  copilotPrompt: null,
  openCopilot: (prompt = null) => set({ copilotOpen: true, copilotPrompt: prompt }),
  closeCopilot: () => set({ copilotOpen: false }),
  consumePrompt: () => set({ copilotPrompt: null }),
}))
