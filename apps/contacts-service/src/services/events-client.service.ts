import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type EventType = 'created' | 'updated' | 'deleted';
type EntityType = 'contact' | 'note';

interface PublishEventParams {
  eventType: EventType;
  entityType: EntityType;
  entityId: string;
  supabaseToken: string;
  meta?: Record<string, any>;
}

@Injectable()
export class EventsClientService {
  private readonly logger = new Logger(EventsClientService.name);
  private readonly eventsServiceUrl: string;
  private readonly eventsApiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.eventsServiceUrl =
      process.env.EVENTS_SERVICE_URL || 'http://localhost:3001';
    this.eventsApiKey = process.env.EVENTS_API_KEY || '';

    if (!this.eventsApiKey) {
      this.logger.warn(
        'EVENTS_API_KEY not found in environment variables. Events publishing will fail.',
      );
    }
  }

  publishEvent({
    eventType,
    entityType,
    entityId,
    supabaseToken,
    meta,
  }: PublishEventParams): void {
    const payload = {
      type: eventType,
      entityType,
      entityId,
      meta: meta || {},
    };

    firstValueFrom(
      this.httpService.post(`${this.eventsServiceUrl}/events`, payload, {
        headers: {
          'x-api-key': this.eventsApiKey,
          'x-supabase-token': supabaseToken,
        },
      }),
    )
      .then(() => {
        this.logger.log(
          `Event published: ${eventType} ${entityType} ${entityId}`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Failed to publish event: ${eventType} ${entityType} ${entityId}`,
          error instanceof Error ? error.message : String(error),
        );
      });
  }
}
