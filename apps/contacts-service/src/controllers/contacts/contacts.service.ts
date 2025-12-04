import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { ContactsRepository } from './contacts.repository';
import { GetContactsQueryDto } from './dto/get-contacts-query.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact-body.dto';
import { UpdateContactDto } from './dto/update-contact-body.dto';

@Injectable()
export class ContactsService {
  constructor(
    private readonly contactsRepository: ContactsRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getContacts(
    userId: string,
    query: GetContactsQueryDto,
  ): Promise<ContactResponseDto[]> {
    const cacheKey = `contacts:${userId}:${JSON.stringify(query)}`;

    const cached = await this.redis.get<ContactResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const { name, email, phone, company, title, sortBy, order } = query;

    // Build where clause for filtering
    const where: Prisma.ContactWhereInput = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    else if (email) where.email = { contains: email, mode: 'insensitive' };
    else if (phone) where.phone = { contains: phone, mode: 'insensitive' };
    else if (company)
      where.company = { contains: company, mode: 'insensitive' };
    else if (title) where.title = { contains: title, mode: 'insensitive' };

    // Build orderBy clause for sorting
    const orderBy: Prisma.ContactOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = order || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const contacts = await this.contactsRepository.findMany(
      userId,
      where,
      orderBy,
    );

    await this.redis.set(cacheKey, contacts, { ex: 300 });

    return contacts;
  }

  async getContact(
    userId: string,
    id: string,
  ): Promise<ContactResponseDto | null> {
    const cacheKey = `contact:${userId}:${id}`;

    const cached = await this.redis.get<ContactResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const contact = await this.contactsRepository.findById(userId, id);

    if (contact) {
      await this.redis.set(cacheKey, contact, { ex: 300 });
    }

    return contact;
  }

  async createContact(
    userId: string,
    dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    const data: Prisma.ContactCreateInput = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      title: dto.title,
      user: {
        connect: { id: userId },
      },
    };

    const contact = await this.contactsRepository.create(userId, data);

    await this.invalidateContactsCaches(userId);

    return contact;
  }

  async updateContact(
    userId: string,
    id: string,
    dto: UpdateContactDto,
  ): Promise<ContactResponseDto | null> {
    const existing = await this.contactsRepository.findById(userId, id);
    if (!existing) {
      return null;
    }

    const data: Prisma.ContactUpdateInput = {
      ...dto,
    };

    const contact = await this.contactsRepository.update(id, data);

    await this.invalidateContactsCaches(userId);
    await this.redis.del(`contact:${userId}:${id}`);

    return contact;
  }

  async deleteContact(
    userId: string,
    id: string,
  ): Promise<ContactResponseDto | null> {
    const existing = await this.contactsRepository.findById(userId, id);
    if (!existing) {
      return null;
    }

    const contact = await this.contactsRepository.delete(id);

    await this.invalidateContactsCaches(userId);
    await this.redis.del(`contact:${userId}:${id}`);

    return contact;
  }

  private async invalidateContactsCaches(userId: string): Promise<void> {
    const keys = await this.redis.keys(`contacts:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
