import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { PrismaService } from './prisma.service';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [ContactsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
