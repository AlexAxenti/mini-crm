import { Injectable } from '@nestjs/common';
// import { Prisma } from '../../../generated/prisma/client';
import { Prisma } from '@prisma/client';
import { ContactsRepository } from './contacts.repository';
import { GetContactsQueryDto } from './dto/get-contacts-query.dto';
import { ContactResponseDto } from './dto/get-contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async getContacts(query: GetContactsQueryDto): Promise<ContactResponseDto[]> {
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
      // Default sort by name ascending
      orderBy.name = 'asc';
    }

    return this.contactsRepository.findMany(where, orderBy);
  }

  async getContact(id: string): Promise<ContactResponseDto | null> {
    return this.contactsRepository.findById(id);
  }

  async createContact(dto: CreateContactDto): Promise<ContactResponseDto> {
    const userId = '00000000-0000-0000-0000-000000000001'; // Hard-coded for now, will come from JWT later

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

    return this.contactsRepository.create(data);
  }

  async updateContact(
    id: string,
    dto: UpdateContactDto,
  ): Promise<ContactResponseDto | null> {
    const data: Prisma.ContactUpdateInput = {
      ...dto,
    };

    return this.contactsRepository.update(id, data);
  }

  async deleteContact(id: string): Promise<ContactResponseDto | null> {
    return this.contactsRepository.delete(id);
  }
}
