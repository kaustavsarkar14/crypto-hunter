import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('shimmer rounded-xl', className)} />
}
