import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Kafka, logLevel, Producer } from 'kafkajs';
import { EntityType, EventType } from '../common/decorators/publish-event.decorator';

const DEFAULT_EVENTS_TOPIC = 'mini-crm.events';

interface PublishKafkaEventParams {
  eventType: EventType;
  entityType: EntityType;
  entityId: string;
  userId: string;
  meta?: Record<string, any>;
}

function formatPem(value?: string): string | undefined {
  return value?.replace(/\\n/g, '\n').trim();
}

@Injectable()
export class KafkaEventPublisherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaEventPublisherService.name);
  private readonly topic = process.env.KAFKA_EVENTS_TOPIC || DEFAULT_EVENTS_TOPIC;
  private producer?: Producer;
  private enabled = false;

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.KAFKA_ENABLED !== 'true') {
      this.logger.log('Kafka event publisher disabled.');
      return;
    }

    const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
    const accessKey = formatPem(process.env.KAFKA_ACCESS_KEY);
    const accessCertificate = formatPem(process.env.KAFKA_ACCESS_CERTIFICATE);
    const caCertificate = formatPem(process.env.KAFKA_CA_CERTIFICATE);

    if (
      !bootstrapServers ||
      !accessKey ||
      !accessCertificate ||
      !caCertificate
    ) {
      this.logger.warn(
        'Kafka event publisher is enabled, but one or more Kafka env vars are missing.',
      );
      return;
    }

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'contacts-service',
      brokers: bootstrapServers.split(',').map((broker) => broker.trim()),
      ssl: {
        ca: [caCertificate],
        cert: accessCertificate,
        key: accessKey,
        rejectUnauthorized: true,
      },
      logLevel: logLevel.WARN,
    });

    const admin = kafka.admin();
    this.producer = kafka.producer();

    try {
      await admin.connect();
      await admin.createTopics({
        topics: [{ topic: this.topic }],
        waitForLeaders: true,
      });
      await this.producer.connect();
      this.enabled = true;
      this.logger.log(`Kafka event publisher connected to ${this.topic}.`);
    } catch (error) {
      this.logger.error(
        `Failed to connect Kafka event publisher to ${this.topic}.`,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      await admin.disconnect().catch(() => undefined);
    }
  }

  publishEvent({
    eventType,
    entityType,
    entityId,
    userId,
    meta,
  }: PublishKafkaEventParams): void {
    if (!this.enabled || !this.producer) {
      return;
    }

    const payload = {
      type: eventType,
      entityType,
      entityId,
      userId,
      meta: meta || {},
    };

    this.producer
      .send({
        topic: this.topic,
        messages: [
          {
            key: `${entityType}:${entityId}`,
            value: JSON.stringify(payload),
          },
        ],
      })
      .then(() => {
        this.logger.log(
          `Kafka event published: ${eventType} ${entityType} ${entityId}`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Failed to publish Kafka event: ${eventType} ${entityType} ${entityId}`,
          error instanceof Error ? error.message : String(error),
        );
      });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer?.disconnect().catch(() => undefined);
  }
}
