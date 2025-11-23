import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { ContactsRepository } from '../contacts/contacts.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, NotesRepository, ContactsRepository, PrismaService],
})
export class NotesModule {}
