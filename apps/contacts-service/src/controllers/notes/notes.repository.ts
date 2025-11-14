import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async create(userId: string, data: Prisma.NoteCreateInput) {
    // Verify the contact belongs to the user
    const contactId =
      typeof data.contact === 'object' && 'connect' in data.contact
        ? data.contact.connect?.id
        : undefined;

    if (contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: contactId, userId },
      });

      if (!contact) {
        throw new Error('Contact not found or does not belong to user');
      }
    }

    return this.prisma.note.create({
      data,
    });
  }

  async update(userId: string, id: string, data: Prisma.NoteUpdateInput) {
    // First check if note exists and belongs to user's contact
    const note = await this.findById(userId, id);
    if (!note) {
      return null;
    }

    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async delete(userId: string, id: string) {
    // First check if note exists and belongs to user's contact
    const note = await this.findById(userId, id);
    if (!note) {
      return null;
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
