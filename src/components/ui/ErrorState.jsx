import { CloudOff } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon={CloudOff}
      title="Couldn't load data"
      description={error?.message ?? 'Something went wrong.'}
      action={onRetry && <Button onClick={onRetry}>Try again</Button>}
    />
  )
}
