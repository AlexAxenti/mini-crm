import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    userId: string,
    where: Prisma.EventWhereInput,
    orderBy: Prisma.EventOrderByWithRelationInput,
  ) {
    return this.prisma.event.findMany({
      where: { ...where, userId },
      orderBy,
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.event.findUnique({
      where: { id, userId },
    });
  }

  async create(userId: string, data: Prisma.EventCreateInput) {
    return this.prisma.event.create({
      data: { ...data, userId },
    });
  }
}
