import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventsModule } from './controllers/events/events.module';
import { PrismaService } from './prisma.service';
import { LoggerMiddleware } from '@mini-crm/shared';

@Module({
  imports: [EventsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
