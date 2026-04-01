interface DashboardStatsProps {
  totalInProgress: number
  totalCompleted: number
  totalCertificates: number
}

export function DashboardStats({
  totalInProgress,
  totalCompleted,
  totalCertificates,
}: DashboardStatsProps) {
  const stats = [
    { label: 'Em Progresso', value: totalInProgress, color: 'bg-blue-100 text-blue-700' },
    { label: 'Concluídos', value: totalCompleted, color: 'bg-green-100 text-green-700' },
    { label: 'Certificados', value: totalCertificates, color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="dashboard-stats">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
        >
          <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
