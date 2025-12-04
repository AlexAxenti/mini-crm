import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { NotesModule } from './controllers/notes/notes.module';
import { UsersModule } from './controllers/users/users.module';
import { HealthModule } from './controllers/health/health.module';
import { PrismaService } from './infra/prisma.service';
import { EventsClientService } from './infra/events-client.service';
import { LoggerMiddleware } from '@mini-crm/shared';
import { RedisModule } from './infra/redis.module';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    ContactsModule,
    NotesModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [],
  providers: [PrismaService, EventsClientService],
  exports: [EventsClientService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
