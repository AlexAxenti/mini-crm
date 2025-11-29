import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { ApiKeyGuard, SupabaseAuthGuard, UuidParam } from '@mini-crm/shared';
import type { AuthorizedRequest } from '@mini-crm/shared';
import { CommKeyGuard } from '../../guards/comm-key.guard';

@Controller('events')
@UseGuards(ApiKeyGuard, SupabaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents(
    @Req() req: AuthorizedRequest,
    @Query() query: GetEventsQueryDto,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEvents(req.userId, query);
  }

  @Get(':id')
  async getEvent(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.getEvent(req.userId, id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  @Post()
  @UseGuards(CommKeyGuard)
  async createEvent(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return await this.eventsService.createEvent(req.userId, dto);
  }
}
