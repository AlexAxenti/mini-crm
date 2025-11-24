import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { NotesRepository } from './notes.repository';
import { ContactsRepository } from '../contacts/contacts.repository';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note-body.dto';
import { UpdateNoteDto } from './dto/update-note-body.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly contactsRepository: ContactsRepository,
  ) {}

  async getNotes(
    userId: string,
    query: GetNotesQueryDto,
  ): Promise<NoteResponseDto[]> {
    const { contactId, sortBy, order } = query;

    const where: Prisma.NoteWhereInput = {};
    if (contactId) {
      where.contactId = contactId;
    }

    const orderBy: Prisma.NoteOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = order || 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    return this.notesRepository.findMany(userId, where, orderBy);
  }

  async getNote(userId: string, id: string): Promise<NoteResponseDto | null> {
    return this.notesRepository.findById(userId, id);
  }

  async createNote(
    userId: string,
    contactId: string,
    dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    // Verify the contact exists and belongs to the user
    const contact = await this.contactsRepository.findById(userId, contactId);
    if (!contact) {
      throw new Error('Contact not found or does not belong to user');
    }

    const data: Prisma.NoteCreateInput = {
      title: dto.title,
      body: dto.body,
      contact: {
        connect: { id: contactId },
      },
    };

    return this.notesRepository.create(data);
  }

  async updateNote(
    userId: string,
    id: string,
    dto: UpdateNoteDto,
  ): Promise<NoteResponseDto | null> {
    // Check if note exists and belongs to user's contact
    const existing = await this.notesRepository.findById(userId, id);
    if (!existing) {
      return null;
    }

    const data: Prisma.NoteUpdateInput = {
      ...dto,
      updatedAt: new Date(),
    };

    return this.notesRepository.update(id, data);
  }

  async deleteNote(
    userId: string,
    id: string,
  ): Promise<NoteResponseDto | null> {
    // Check if note exists and belongs to user's contact
    const existing = await this.notesRepository.findById(userId, id);
    if (!existing) {
      return null;
    }

    return this.notesRepository.delete(id);
  }
}
