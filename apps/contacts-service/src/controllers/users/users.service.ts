import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user-body.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(
    userId: string,
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findById(userId);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const email = dto.email;
    if (!email) {
      throw new ConflictException('Email is required');
    }

    const existingEmail = await this.usersRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    return this.usersRepository.create(userId, email);
  }

  async getUser(userId: string): Promise<UserResponseDto | null> {
    return this.usersRepository.findById(userId);
  }
}
