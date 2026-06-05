import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('E-mail já cadastrado')

    const hashed = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role,
        ...(dto.role === 'STUDENT' ? { student: { create: {} } } : {}),
        ...(dto.role === 'TEACHER' ? { teacher: { create: {} } } : {}),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const tokens = await this.generateTokens(user.id, user.role)
    return { user, ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    const tokens = await this.generateTokens(user.id, user.role)
    const { password: _, ...safeUser } = user
    return { user: safeUser, ...tokens }
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } })
    if (!user) throw new UnauthorizedException()

    // Rotate token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } })
    return this.generateTokens(user.id, user.role)
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } })
    return { message: 'Sessão encerrada' }
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, role },
      { expiresIn: '15m', secret: this.config.get('JWT_SECRET') },
    )

    const refreshTokenValue = this.jwt.sign(
      { sub: userId },
      { expiresIn: '7d', secret: this.config.get('JWT_REFRESH_SECRET') },
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId, expiresAt },
    })

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900, // 15 min em segundos
    }
  }
}
