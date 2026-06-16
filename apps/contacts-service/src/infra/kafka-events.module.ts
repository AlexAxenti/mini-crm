import { Global, Module } from '@nestjs/common';
import { KafkaEventPublisherService } from './kafka-event-publisher.service';

@Global()
@Module({
  providers: [KafkaEventPublisherService],
  exports: [KafkaEventPublisherService],
})
export class KafkaEventsModule {}
