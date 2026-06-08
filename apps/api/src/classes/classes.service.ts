import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClassDto } from './dto/class.dto'

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
}
