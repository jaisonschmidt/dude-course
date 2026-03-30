import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { IUserRepository } from '../repositories/user-repository.js'
import type { AuthUserResponseDto, LoginResponseDto } from '../dto/auth-dto.js'
import { ConflictError, UnauthorizedError } from '../models/errors.js'
import { env } from '../config/env.js'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

const BCRYPT_ROUNDS = 10

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(data: RegisterInput): Promise<AuthUserResponseDto> {
    const existing = await this.userRepository.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }

  async login(data: LoginInput): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    )

    return {
      accessToken,
      expiresIn: '1h',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }
}
