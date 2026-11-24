import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import type { Response } from 'express'
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

  // ── Books ─────────────────────────────────────────────────────────────────

  @Post(':id/books')
  @Roles('TEACHER')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar livro (PDF) para a turma' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  addBook(
    @Param('id') id: string,
    @Body('title') title: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return this.classesService.addBook(id, userId, title || file.originalname, file)
  }

  @Get(':id/books')
  @ApiOperation({ summary: 'Listar livros da turma' })
  books(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.classesService.findBooks(id, userId)
  }

  @Get(':id/books/:bookId/file')
  @ApiOperation({ summary: 'Baixar o PDF de um livro da turma' })
  async bookFile(
    @Param('id') id: string,
    @Param('bookId') bookId: string,
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
  ) {
    res.sendFile(await this.classesService.getBookFile(id, bookId, userId))
  }
}
