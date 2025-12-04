import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
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
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getNotes(
    userId: string,
    query: GetNotesQueryDto,
  ): Promise<NoteResponseDto[]> {
    const cacheKey = `notes:${userId}:${JSON.stringify(query)}`;

    const cached = await this.redis.get<NoteResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

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

    const notes = await this.notesRepository.findMany(userId, where, orderBy);

    await this.redis.set(cacheKey, notes, { ex: 300 });

    return notes;
  }

  async getNote(userId: string, id: string): Promise<NoteResponseDto | null> {
    const cacheKey = `note:${userId}:${id}`;

    const cached = await this.redis.get<NoteResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const note = await this.notesRepository.findById(userId, id);

    if (note) {
      await this.redis.set(cacheKey, note, { ex: 300 });
    }

    return note;
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

    const note = await this.notesRepository.create(data);

    await this.invalidateNotesCaches(userId);

    return note;
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

    const note = await this.notesRepository.update(id, data);

    await this.invalidateNotesCaches(userId);
    await this.redis.del(`note:${userId}:${id}`);

    return note;
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

    const note = await this.notesRepository.delete(id);

    await this.invalidateNotesCaches(userId);
    await this.redis.del(`note:${userId}:${id}`);

    return note;
  }

  private async invalidateNotesCaches(userId: string): Promise<void> {
    const keys = await this.redis.keys(`notes:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
