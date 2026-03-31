export interface DashboardProgress {
  completed: number
  total: number
  percentage: number
}

export interface DashboardInProgressCourse {
  courseId: number
  title: string
  thumbnailUrl: string | null
  progress: DashboardProgress
}

export interface DashboardCompletedCourse {
  courseId: number
  title: string
  completedAt: string
}

export interface DashboardCertificate {
  courseId: number
  title: string
  certificateCode: string
  issuedAt: string
}

export interface Dashboard {
  inProgress: DashboardInProgressCourse[]
  completed: DashboardCompletedCourse[]
  certificates: DashboardCertificate[]
}
