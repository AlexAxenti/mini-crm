import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Kafka, logLevel, Producer } from 'kafkajs';

const DEFAULT_TOPIC = 'mini-crm.kafka.smoke';

function formatPem(value?: string): string | undefined {
  return value?.replace(/\\n/g, '\n').trim();
}

@Injectable()
export class KafkaSmokePublisherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaSmokePublisherService.name);
  private producer?: Producer;

  async onApplicationBootstrap(): Promise<void> {
    if (
      process.env.KAFKA_ENABLED !== 'true' ||
      process.env.KAFKA_SMOKE_ENABLED !== 'true'
    ) {
      this.logger.log('Kafka smoke publisher disabled.');
      return;
    }

    const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS;
    const accessKey = formatPem(process.env.KAFKA_ACCESS_KEY);
    const accessCertificate = formatPem(process.env.KAFKA_ACCESS_CERTIFICATE);
    const caCertificate = formatPem(process.env.KAFKA_CA_CERTIFICATE);
    const topic =
      process.env.KAFKA_SMOKE_TOPIC || process.env.KAFKA_TOPIC || DEFAULT_TOPIC;

    if (
      !bootstrapServers ||
      !accessKey ||
      !accessCertificate ||
      !caCertificate
    ) {
      this.logger.warn(
        'Kafka smoke publisher is enabled, but one or more Kafka env vars are missing.',
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
        topics: [{ topic }],
        waitForLeaders: true,
      });
      await this.producer.connect();
      await this.producer.send({
        topic,
        messages: [
          {
            key: 'contacts-service-smoke',
            value: `hello world from contacts-service at ${new Date().toISOString()}`,
          },
        ],
      });
      this.logger.log(`Kafka smoke message published to ${topic}.`);
    } catch (error) {
      this.logger.error(
        `Failed to publish Kafka smoke message to ${topic}.`,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      await admin.disconnect().catch(() => undefined);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer?.disconnect().catch(() => undefined);
  }
}
