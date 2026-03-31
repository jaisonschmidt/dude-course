import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  icon?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  message,
  icon = '📭',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 text-4xl" aria-hidden="true">{icon}</span>
      <p className="mb-4 text-gray-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
