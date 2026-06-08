import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsDateString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'

export class CreateSessionDto {
  @ApiProperty({ description: 'ID da turma' })
  @IsString()
  @IsNotEmpty()
  classId: string

  @ApiProperty({ description: 'Data e hora agendada da aula (ISO 8601)' })
  @IsDateString()
  scheduledAt: string
}

export class SessionResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  classId: string

  @ApiProperty()
  teacherId: string

  @ApiProperty()
  scheduledAt: Date

  @ApiPropertyOptional()
  startedAt?: Date | null

  @ApiPropertyOptional()
  endedAt?: Date | null

  @ApiProperty({ enum: ['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'] })
  status: string

  @ApiPropertyOptional()
  recordingUrl?: string | null

  @ApiProperty()
  createdAt: Date
}
