import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        service: 'contacts-service',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      console.log('Health check error:', error);

      return {
        status: 'unhealthy',
        service: 'contacts-service',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Internal server error',
      };
    }
  }
}
