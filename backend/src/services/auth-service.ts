import type { IUserRepository } from '../repositories/user-repository.js'
import type { AuthUserResponseDto, LoginResponseDto } from '../dto/auth-dto.js'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(_data: RegisterInput): Promise<AuthUserResponseDto> {
    // TODO: implement
    // 1. Check if email already exists (findByEmail) → throw 409 CONFLICT if found
    // 2. Hash password with bcrypt (min 10 rounds) — never store plain password
    // 3. Create user via userRepository.create()
    // 4. Return user DTO (without passwordHash)
    throw new Error('AuthService.register not implemented')
  }

  async login(_data: LoginInput): Promise<LoginResponseDto> {
    // TODO: implement
    // 1. Find user by email → throw 401 UNAUTHORIZED if not found
    // 2. Compare password with bcrypt → throw 401 if mismatch
    // 3. Sign JWT with env.JWT_SECRET, expiresIn: '1h'
    // 4. Never include passwordHash in response
    throw new Error('AuthService.login not implemented')
  }
}
