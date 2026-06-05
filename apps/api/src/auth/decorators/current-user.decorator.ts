import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  sub: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Extrai o usuário autenticado do request.
 * Uso: @CurrentUser() user: JwtPayload
 * Ou: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user: JwtPayload = request.user
    return data ? user?.[data] : user
  },
)
