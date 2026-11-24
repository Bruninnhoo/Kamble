import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClassDto } from './dto/class.dto'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

export const UPLOADS_DIR = join(process.cwd(), 'uploads')

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(teacherUserId: string, dto: CreateClassDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    })
    if (!teacher) throw new ForbiddenException('Apenas professores podem criar turmas')

    return this.prisma.class.create({
      data: {
        name: dto.name,
        level: dto.level,
        maxStudents: dto.maxStudents ?? 10,
        teacherId: teacher.id,
      },
    })
  }

  async findByTeacher(teacherUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    })
    if (!teacher) return []

    const classes = await this.prisma.class.findMany({
      where: { teacherId: teacher.id },
      include: { _count: { select: { enrollments: { where: { active: true } } } } },
      orderBy: { createdAt: 'desc' },
    })

    return classes.map((c) => ({
      ...c,
      studentsCount: c._count.enrollments,
    }))
  }

  async findEnrolled(studentUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    })
    if (!student) return []

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id, active: true },
      include: {
        class: {
          include: {
            teacher: { include: { user: { select: { name: true } } } },
            _count: { select: { enrollments: { where: { active: true } } } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return enrollments.map((e) => ({
      ...e.class,
      studentsCount: e.class._count.enrollments,
      teacherName: e.class.teacher.user.name,
    }))
  }

  async findById(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
        _count: { select: { enrollments: { where: { active: true } } } },
      },
    })
    if (!cls) throw new NotFoundException('Turma não encontrada')
    return { ...cls, studentsCount: cls._count.enrollments }
  }

  // ── Books ─────────────────────────────────────────────────────────────────

  async addBook(classId: string, teacherUserId: string, title: string, file: Express.Multer.File) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId, teacher: { userId: teacherUserId } },
    })
    if (!cls) throw new ForbiddenException('Apenas o professor desta turma pode enviar livros')

    const filePath = `books/${randomUUID()}.pdf`
    await mkdir(join(UPLOADS_DIR, 'books'), { recursive: true })
    await writeFile(join(UPLOADS_DIR, filePath), file.buffer)

    return this.prisma.book.create({
      data: { title, filePath, classId, uploadedById: teacherUserId },
    })
  }

  async findBooks(classId: string, userId: string) {
    await this.assertAccess(classId, userId)
    return this.prisma.book.findMany({
      where: { classId },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getBookFile(classId: string, bookId: string, userId: string) {
    await this.assertAccess(classId, userId)
    const book = await this.prisma.book.findFirst({ where: { id: bookId, classId } })
    if (!book) throw new NotFoundException('Livro não encontrado')
    return join(UPLOADS_DIR, book.filePath)
  }

  /** Teacher of the class or actively enrolled student. */
  async canAccessClass(classId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.class.count({
      where: {
        id: classId,
        OR: [
          { teacher: { userId } },
          { enrollments: { some: { active: true, student: { userId } } } },
        ],
      },
    })
    return count > 0
  }

  private async assertAccess(classId: string, userId: string) {
    if (!(await this.canAccessClass(classId, userId))) {
      throw new ForbiddenException('Você não tem acesso a esta turma')
    }
  }
}
