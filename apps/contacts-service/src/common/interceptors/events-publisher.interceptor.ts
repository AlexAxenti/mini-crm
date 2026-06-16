import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { KafkaEventPublisherService } from '../../infra/kafka-event-publisher.service';
import {
  PUBLISH_EVENT_KEY,
  PublishEventMetadata,
  DEFAULT_META_EXTRACTORS,
} from '../decorators/publish-event.decorator';
import { AuthorizedRequest } from '@mini-crm/shared';

@Injectable()
export class EventsPublisherInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly kafkaEventPublisher: KafkaEventPublisherService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<PublishEventMetadata>(
      PUBLISH_EVENT_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();

    return next.handle().pipe(
      tap((data: Record<string, any>) => {
        // async event publishing after response
        if (data?.id) {
          const extractMeta =
            metadata.extractMeta ||
            DEFAULT_META_EXTRACTORS[metadata.entityType];

          const meta = extractMeta ? extractMeta(data) : undefined;

          this.kafkaEventPublisher.publishEvent({
            eventType: metadata.eventType,
            entityType: metadata.entityType,
            entityId: data.id as string,
            userId: request.userId,
            meta,
          });
        }
      }),
    );
  }
}
