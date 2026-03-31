import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message: string
  requestId?: string | null
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, requestId, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-red-600" aria-hidden="true">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
          {requestId && (
            <p className="mt-1 text-xs text-red-600">
              ID da requisição: {requestId}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-700 underline transition-colors hover:text-red-900"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
