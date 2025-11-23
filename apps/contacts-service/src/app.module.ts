import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { NotesModule } from './controllers/notes/notes.module';
import { UsersModule } from './controllers/users/users.module';
import { PrismaService } from './prisma.service';
import { LoggerMiddleware } from '@mini-crm/shared';

@Module({
  imports: [ContactsModule, NotesModule, UsersModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
