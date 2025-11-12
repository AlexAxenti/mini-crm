import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    where: Prisma.NoteWhereInput,
    orderBy: Prisma.NoteOrderByWithRelationInput,
  ) {
    return this.prisma.note.findMany({
      where,
      orderBy,
    });
  }

  async findById(id: string) {
    return this.prisma.note.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.NoteCreateInput) {
    return this.prisma.note.create({
      data,
    });
  }

  async update(id: string, data: Prisma.NoteUpdateInput) {
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
