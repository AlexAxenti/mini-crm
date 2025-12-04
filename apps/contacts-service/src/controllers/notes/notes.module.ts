import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { ContactsRepository } from '../contacts/contacts.repository';
import { PrismaService } from '../../infra/prisma.service';
import { EventsClientService } from '../../infra/events-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [NotesController],
  providers: [
    NotesService,
    NotesRepository,
    ContactsRepository,
    PrismaService,
    EventsClientService,
  ],
  imports: [HttpModule],
})
export class NotesModule {}
