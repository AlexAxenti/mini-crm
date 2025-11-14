import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    userId: string,
    where: Prisma.ContactWhereInput,
    orderBy: Prisma.ContactOrderByWithRelationInput,
  ) {
    return this.prisma.contact.findMany({
      where: { ...where, userId },
      orderBy,
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.contact.findUnique({
      where: { id, userId },
    });
  }

  async create(userId: string, data: Prisma.ContactCreateInput) {
    return this.prisma.contact.create({
      data: { ...data, user: { connect: { id: userId } } },
    });
  }

  async update(userId: string, id: string, data: Prisma.ContactUpdateInput) {
    // First check if contact exists and belongs to user
    const contact = await this.findById(userId, id);
    if (!contact) {
      return null;
    }

    return this.prisma.contact.update({
      where: { id, userId },
      data,
    });
  }

  async delete(userId: string, id: string) {
    // First check if contact exists and belongs to user
    const contact = await this.findById(userId, id);
    if (!contact) {
      return null;
    }

    await this.prisma.note.deleteMany({
      where: { contactId: id },
    });
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
