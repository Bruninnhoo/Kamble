import { ServiceUnavailableException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { HealthController } from './health.controller'

const controllerWith = (queryRaw: jest.Mock) =>
  new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService)

describe('HealthController', () => {
  it('returns ok when the database answers', async () => {
    const controller = controllerWith(jest.fn().mockResolvedValue([]))
    await expect(controller.check()).resolves.toEqual({ status: 'ok' })
  })

  it('returns 503 when the database is down', async () => {
    const controller = controllerWith(jest.fn().mockRejectedValue(new Error('down')))
    await expect(controller.check()).rejects.toThrow(ServiceUnavailableException)
  })
})
