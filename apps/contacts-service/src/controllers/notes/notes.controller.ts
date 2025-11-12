import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note-body.dto';
import { UpdateNoteDto } from './dto/update-note-body.dto';
import { NotesService } from './notes.service';
import { UuidParam } from '../../util/parse-uuid-param';
import { Prisma } from '@prisma/client';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(@Query() query: GetNotesQueryDto): Promise<NoteResponseDto[]> {
    return this.notesService.getNotes(query);
  }

  @Get(':id')
  async getNote(@UuidParam('id') id: string): Promise<NoteResponseDto> {
    const note = await this.notesService.getNote(id);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  @Post(':contactId')
  async createNote(
    @UuidParam('contactId') contactId: string,
    @Body() dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    try {
      return await this.notesService.createNote(contactId, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Contact with ID ${contactId} not found`);
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateNote(
    @UuidParam('id') id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    try {
      return await this.notesService.updateNote(id, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Note with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteNote(@UuidParam('id') id: string): Promise<NoteResponseDto> {
    try {
      return await this.notesService.deleteNote(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Note with ID ${id} not found`);
      }
      throw error;
    }
  }
}
