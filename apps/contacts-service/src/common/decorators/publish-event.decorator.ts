import { SetMetadata } from '@nestjs/common';

export const PUBLISH_EVENT_KEY = 'publishEvent';

export type EventType = 'created' | 'updated' | 'deleted';
export type EntityType = 'contact' | 'note';

export interface PublishEventMetadata {
  eventType: EventType;
  entityType: EntityType;
  extractMeta?: (data: Record<string, any>) => Record<string, any>;
}

export const DEFAULT_META_EXTRACTORS: Record<
  EntityType,
  (data: Record<string, any>) => Record<string, any>
> = {
  contact: (data) => ({
    name: data.name as string,
    email: data.email as string,
  }),
  note: (data) => ({
    title: data.title as string,
  }),
};

export const PublishEvent = (metadata: PublishEventMetadata) =>
  SetMetadata(PUBLISH_EVENT_KEY, metadata);
