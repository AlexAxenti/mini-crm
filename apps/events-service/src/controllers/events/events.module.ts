import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, PrismaService],
})
export class EventsModule {}
