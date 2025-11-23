import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { UuidParam } from '../../util/parse-uuid-param';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents(
    // TODO: Add userId from middleware
    @Query() query: GetEventsQueryDto,
  ): Promise<EventResponseDto[]> {
    // TODO: Replace with actual userId from middleware
    const userId = 'temp-user-id';
    return this.eventsService.getEvents(userId, query);
  }

  @Get(':id')
  async getEvent(@UuidParam('id') id: string): Promise<EventResponseDto> {
    // TODO: Replace with actual userId from middleware
    const userId = 'temp-user-id';
    const event = await this.eventsService.getEvent(userId, id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  @Post()
  async createEvent(@Body() dto: CreateEventDto): Promise<EventResponseDto> {
    // TODO: Replace with actual userId from middleware
    const userId = 'temp-user-id';
    return await this.eventsService.createEvent(userId, dto);
  }
}
