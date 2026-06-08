import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator'
import { EnglishLevel } from '@prisma/client'

export class CreateClassDto {
  @ApiProperty({ description: 'Nome da turma' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ enum: EnglishLevel })
  @IsEnum(EnglishLevel)
  level: EnglishLevel

  @ApiPropertyOptional({ description: 'Máximo de alunos', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  maxStudents?: number
}

export class ClassResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() teacherId: string
  @ApiProperty({ enum: EnglishLevel }) level: EnglishLevel
  @ApiProperty() maxStudents: number
  @ApiProperty() status: string
  @ApiProperty() createdAt: Date
  @ApiPropertyOptional() studentsCount?: number
}
