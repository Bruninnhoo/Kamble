import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

enum RegisterRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'senha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ enum: RegisterRole })
  @IsEnum(RegisterRole)
  role: RegisterRole
}

export class LoginDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password: string
}
