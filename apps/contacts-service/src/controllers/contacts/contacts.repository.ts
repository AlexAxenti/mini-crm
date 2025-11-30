import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';

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

  async update(id: string, data: Prisma.ContactUpdateInput) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.note.deleteMany({
      where: { contactId: id },
    });
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
