export interface Certificate {
  id: number
  userId: number
  courseId: number
  certificateCode: string
  issuedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateCertificateData {
  userId: number
  courseId: number
  certificateCode: string
}
