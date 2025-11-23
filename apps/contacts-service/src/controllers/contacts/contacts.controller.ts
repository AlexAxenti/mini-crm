import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  NotFoundException,
  ConflictException,
  Req,
} from '@nestjs/common';
import { GetContactsQueryDto } from './dto/get-contacts-query.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { CreateContactDto } from './dto/create-contact-body.dto';
import { UpdateContactDto } from './dto/update-contact-body.dto';
import { ContactsService } from './contacts.service';
import { UuidParam, AuthorizedRequest } from '@mini-crm/shared';
import { Prisma } from '../../../generated/prisma/client';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async getContacts(
    @Req() req: AuthorizedRequest,
    @Query() query: GetContactsQueryDto,
  ): Promise<ContactResponseDto[]> {
    return this.contactsService.getContacts(req.userId, query);
  }

  @Get(':id')
  async getContact(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<ContactResponseDto> {
    const contact = await this.contactsService.getContact(req.userId, id);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  @Post()
  async createContact(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateContactDto,
  ): Promise<ContactResponseDto> {
    try {
      return await this.contactsService.createContact(req.userId, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.[0] || 'field';
        throw new ConflictException(
          `A contact with this ${field} already exists`,
        );
      }
      throw error;
    }
  }

  @Patch(':id')
  async updateContact(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<ContactResponseDto> {
    try {
      const contact = await this.contactsService.updateContact(
        req.userId,
        id,
        dto,
      );
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }
      return contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.[0] || 'field';
        throw new ConflictException(
          `A contact with this ${field} already exists`,
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  async deleteContact(
    @Req() req: AuthorizedRequest,
    @UuidParam('id') id: string,
  ): Promise<ContactResponseDto> {
    const contact = await this.contactsService.deleteContact(req.userId, id);
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    return contact;
  }
}
