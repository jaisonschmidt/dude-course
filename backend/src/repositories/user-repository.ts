import type { User, CreateUserData } from '../models/user.js'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(_email: string): Promise<User | null> {
    // TODO: implement with Prisma
    // import { prisma } from '../../database/src/client.js'
    throw new Error('PrismaUserRepository.findByEmail not implemented')
  }

  async findById(_id: number): Promise<User | null> {
    // TODO: implement with Prisma
    throw new Error('PrismaUserRepository.findById not implemented')
  }

  async create(_data: CreateUserData): Promise<User> {
    // TODO: implement with Prisma
    throw new Error('PrismaUserRepository.create not implemented')
  }
}
