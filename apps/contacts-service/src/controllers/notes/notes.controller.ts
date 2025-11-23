import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { CreateNoteDto } from './dto/create-note-body.dto';
import { UpdateNoteDto } from './dto/update-note-body.dto';
import { NotesService } from './notes.service';
import { UuidParam, AuthorizedRequest } from '@mini-crm/shared';
import { Prisma } from '@prisma/client';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(
    @Req() req: AuthorizedRequest,
    @Query() query: GetNotesQueryDto,
  ): Promise<NoteResponseDto[]> {
    return this.notesService.getNotes(req.userId, query);
  }

  @Get(':id')
  async getNote(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.getNote(req.userId, id);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  @Post(':contactId')
  async createNote(
    @Req() req: AuthorizedRequest,
    @UuidParam('contactId') contactId: string,
    @Body() dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    try {
      return await this.notesService.createNote(req.userId, contactId, dto);
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
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.updateNote(req.userId, id, dto);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  @Delete(':id')
  async deleteNote(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.deleteNote(req.userId, id);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }
}
