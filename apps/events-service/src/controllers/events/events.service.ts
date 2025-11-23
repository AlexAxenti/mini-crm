import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventsRepository } from './events.repository';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async getEvents(
    userId: string,
    query: GetEventsQueryDto,
  ): Promise<EventResponseDto[]> {
    const { type, entityType, entityId, order } = query;

    const where: Prisma.EventWhereInput = {};

    if (type) where.type = type;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const orderBy: Prisma.EventOrderByWithRelationInput = {
      createdAt: order || 'desc',
    };

    return this.eventsRepository.findMany(userId, where, orderBy);
  }

  async getEvent(userId: string, id: string): Promise<EventResponseDto | null> {
    return this.eventsRepository.findById(userId, id);
  }

  async createEvent(
    userId: string,
    dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const data: Prisma.EventCreateInput = {
      userId,
      type: dto.type,
      entityType: dto.entityType,
      entityId: dto.entityId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta: dto.meta ?? null,
    };

    return this.eventsRepository.create(userId, data);
  }
}
