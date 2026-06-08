import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSessionDto } from './dto/session.dto'
import { SessionStatus } from '@prisma/client'

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async create(teacherUserId: string, dto: CreateSessionDto) {
    // Resolve teacher record from userId
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    })
    if (!teacher) throw new ForbiddenException('Apenas professores podem criar sessões')

    // Validate class belongs to teacher
    const cls = await this.prisma.class.findFirst({
      where: { id: dto.classId, teacherId: teacher.id },
    })
    if (!cls) throw new NotFoundException('Turma não encontrada ou não pertence a este professor')

    return this.prisma.session.create({
      data: {
        classId: dto.classId,
        teacherId: teacher.id,
        scheduledAt: new Date(dto.scheduledAt),
        status: 'SCHEDULED',
      },
    })
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async findById(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { id: true, name: true, level: true } },
        teacher: { select: { id: true, user: { select: { name: true, avatarUrl: true } } } },
      },
    })
    if (!session) throw new NotFoundException('Sessão não encontrada')
    return session
  }

  async findByClass(classId: string) {
    return this.prisma.session.findMany({
      where: { classId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        teacher: { select: { user: { select: { name: true, avatarUrl: true } } } },
      },
    })
  }

  // ── Start / End ───────────────────────────────────────────────────────────

  async start(sessionId: string, teacherUserId: string) {
    const session = await this._getSessionForTeacher(sessionId, teacherUserId)

    if (session.status === 'LIVE') return session
    if (session.status !== 'SCHEDULED') {
      throw new BadRequestException('Sessão não pode ser iniciada neste estado')
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'LIVE', startedAt: new Date() },
    })
  }

  async end(sessionId: string, teacherUserId: string) {
    const session = await this._getSessionForTeacher(sessionId, teacherUserId)

    if (session.status === 'ENDED') return session
    if (session.status !== 'LIVE') {
      throw new BadRequestException('Sessão não está ao vivo')
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ENDED', endedAt: new Date() },
    })
  }

  // ── Auth helper ───────────────────────────────────────────────────────────

  /**
   * Returns true if the user can join this session:
   *  - Teacher of this session
   *  - Student enrolled in the class
   */
  async canJoin(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        teacher: { select: { userId: true } },
        class: {
          include: {
            enrollments: {
              where: {
                student: { userId },
                active: true,
              },
            },
          },
        },
      },
    })
    if (!session) return false
    if (session.status === 'CANCELLED') return false

    const isTeacher = session.teacher.userId === userId
    const isEnrolledStudent = session.class.enrollments.length > 0
    return isTeacher || isEnrolledStudent
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async _getSessionForTeacher(sessionId: string, teacherUserId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { teacher: { select: { userId: true } } },
    })
    if (!session) throw new NotFoundException('Sessão não encontrada')
    if (session.teacher.userId !== teacherUserId) {
      throw new ForbiddenException('Apenas o professor desta turma pode fazer esta ação')
    }
    return session
  }
}
