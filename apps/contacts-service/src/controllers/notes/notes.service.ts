import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotesRepository } from './notes.repository';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note-body.dto';
import { UpdateNoteDto } from './dto/update-note-body.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async getNotes(query: GetNotesQueryDto): Promise<NoteResponseDto[]> {
    const { sortBy, order } = query;

    // Where clause if needed later
    const where: Prisma.NoteWhereInput = {};

    const orderBy: Prisma.NoteOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = order || 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    return this.notesRepository.findMany(where, orderBy);
  }

  async getNote(id: string): Promise<NoteResponseDto | null> {
    return this.notesRepository.findById(id);
  }

  async createNote(
    contactId: string,
    dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    const data: Prisma.NoteCreateInput = {
      title: dto.title,
      body: dto.body,
      contact: {
        connect: { id: contactId },
      },
    };

    return this.notesRepository.create(data);
  }

  async updateNote(id: string, dto: UpdateNoteDto): Promise<NoteResponseDto> {
    const data: Prisma.NoteUpdateInput = {
      ...dto,
      updatedAt: new Date(),
    };

    return this.notesRepository.update(id, data);
  }

  async deleteNote(id: string): Promise<NoteResponseDto> {
    return this.notesRepository.delete(id);
  }
}
