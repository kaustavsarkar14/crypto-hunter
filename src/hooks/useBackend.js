import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../lib/api'

/**
 * Runtime capability check against /api/health, so one build works everywhere:
 * Vercel (functions), local dev (Worker), or static hosting (features hide themselves).
 */
export function useBackend() {
  const { data } = useQuery({ queryKey: ['backend-health'], queryFn: fetchHealth, staleTime: 5 * 60_000, retry: 1 })
  return { news: data?.ok === true, copilot: data?.ok === true && data?.copilot === true }
}
