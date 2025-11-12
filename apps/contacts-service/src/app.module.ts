import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { NotesModule } from './controllers/notes/notes.module';
import { PrismaService } from './prisma.service';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [ContactsModule, NotesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
