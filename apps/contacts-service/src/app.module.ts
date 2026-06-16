import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContactsModule } from './controllers/contacts/contacts.module';
import { NotesModule } from './controllers/notes/notes.module';
import { UsersModule } from './controllers/users/users.module';
import { HealthModule } from './controllers/health/health.module';
import { PrismaService } from './infra/prisma.service';
import { LoggerMiddleware } from '@mini-crm/shared';
import { RedisModule } from './infra/redis.module';
import { KafkaEventsModule } from './infra/kafka-events.module';

@Module({
  imports: [
    RedisModule,
    ContactsModule,
    NotesModule,
    UsersModule,
    HealthModule,
    KafkaEventsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
