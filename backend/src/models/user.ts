export type UserRole = 'learner' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  name: string
  email: string
  passwordHash: string
  role?: UserRole
}
