import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    userId: string,
    where: Prisma.NoteWhereInput,
    orderBy: Prisma.NoteOrderByWithRelationInput,
  ) {
    return this.prisma.note.findMany({
      where: {
        ...where,
        contact: {
          userId,
        },
      },
      orderBy,
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.note.findFirst({
      where: {
        id,
        contact: {
          userId,
        },
      },
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
