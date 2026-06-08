import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { SessionsService } from './sessions.service'
import { CreateSessionDto, SessionResponseDto } from './dto/session.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard, Roles } from '../auth/guards/roles.guard'
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator'

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  @Post('sessions')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Criar nova sessão de aula (professor)' })
  @ApiResponse({ status: 201, type: SessionResponseDto })
  create(@Body() dto: CreateSessionDto, @CurrentUser('sub') userId: string) {
    return this.sessionsService.create(userId, dto)
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Buscar detalhes de uma sessão' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(id)
  }

  @Get('classes/:classId/sessions')
  @ApiOperation({ summary: 'Listar sessões de uma turma' })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  findByClass(@Param('classId') classId: string) {
    return this.sessionsService.findByClass(classId)
  }

  // ── Start / End ───────────────────────────────────────────────────────────

  @Patch('sessions/:id/start')
  @Roles('TEACHER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sessão (muda status para LIVE)' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  start(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.sessionsService.start(id, user.sub)
  }

  @Patch('sessions/:id/end')
  @Roles('TEACHER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão (muda status para ENDED)' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  end(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.sessionsService.end(id, user.sub)
  }
}
