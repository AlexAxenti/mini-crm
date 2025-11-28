import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from './contacts.repository';
import { PrismaService } from '../../prisma.service';
import { EventsClientService } from '../../services/events-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ContactsController],
  providers: [
    ContactsService,
    ContactsRepository,
    PrismaService,
    EventsClientService,
  ],
  imports: [HttpModule],
})
export class ContactsModule {}
