import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-body.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthorizedRequest } from '../../types/authorized-request';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    try {
      // Extract email from JWT if available (from the decoded token)
      return await this.usersService.createUser(req.userId, dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  @Get('me')
  async getCurrentUser(
    @Req() req: AuthorizedRequest,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.getUser(req.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
