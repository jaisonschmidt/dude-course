import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
