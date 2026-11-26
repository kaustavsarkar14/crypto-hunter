import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="That page wandered off the chart."
      action={
        <Link to="/markets" viewTransition className="text-[15px] font-medium text-accent">
          Go to markets →
        </Link>
      }
    />
  )
}
