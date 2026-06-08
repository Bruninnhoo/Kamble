import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ClassesService } from './classes.service'
import { CreateClassDto, ClassResponseDto } from './dto/class.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard, Roles } from '../auth/guards/roles.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Criar nova turma (professor)' })
  @ApiResponse({ status: 201, type: ClassResponseDto })
  create(@Body() dto: CreateClassDto, @CurrentUser('sub') userId: string) {
    return this.classesService.create(userId, dto)
  }

  @Get('my')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Listar turmas do professor autenticado' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  myClasses(@CurrentUser('sub') userId: string) {
    return this.classesService.findByTeacher(userId)
  }

  @Get('enrolled')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Listar turmas em que o aluno está matriculado' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  enrolledClasses(@CurrentUser('sub') userId: string) {
    return this.classesService.findEnrolled(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de uma turma' })
  @ApiResponse({ status: 200, type: ClassResponseDto })
  findOne(@Param('id') id: string) {
    return this.classesService.findById(id)
  }
}
