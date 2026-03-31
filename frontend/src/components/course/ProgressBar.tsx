import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function ProgressBar({ completed, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentage}% concluído`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            percentage === 100 ? 'bg-green-500' : 'bg-blue-500',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600">{percentage}%</span>
    </div>
  )
}
