import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    where: Prisma.ContactWhereInput,
    orderBy: Prisma.ContactOrderByWithRelationInput,
  ) {
    return this.prisma.contact.findMany({
      where,
      orderBy,
    });
  }

  async findById(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ContactCreateInput) {
    return this.prisma.contact.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ContactUpdateInput) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
