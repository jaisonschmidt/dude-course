import type { User, CreateUserData } from '../models/user.js'
import { prisma } from 'database'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return this.mapToUser(user)
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return this.mapToUser(user)
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'learner',
      },
    })

    return this.mapToUser(user)
  }

  private mapToUser(user: any): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
