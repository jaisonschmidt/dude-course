export interface DashboardInProgressDto {
  courseId: number
  title: string
  thumbnailUrl: string | null
  progress: {
    completed: number
    total: number
    percentage: number
  }
}

export interface DashboardCompletedDto {
  courseId: number
  title: string
  completedAt: string
}

export interface DashboardCertificateDto {
  courseId: number
  title: string
  certificateCode: string
  issuedAt: string
}

export interface DashboardResponseDto {
  inProgress: DashboardInProgressDto[]
  completed: DashboardCompletedDto[]
  certificates: DashboardCertificateDto[]
}
