import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prismalib';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.client.user.create({
        data: {
          ...createUserDto,
          password: await bcrypt.hash(createUserDto.password, 10),
        },
        omit: { password: true },
      });
    } catch (error: unknown) {
      // Prisma error code for "Unique constraint failed"
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error as Prisma.PrismaClientKnownRequestError).code === 'P2002'
      ) {
        throw new ConflictException('Username or email already exists');
      }
      throw error; // Rethrow any other unexpected database errors
    }
  }

  findAll() {
    return this.prisma.client.user.findMany({
      omit: { password: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;

    try {
      return await this.prisma.client.user.update({
        where: { id },
        data: {
          ...rest,
          ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        },
        omit: { password: true },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error as Prisma.PrismaClientKnownRequestError).code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error; // Rethrow any other unexpected database errors
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.client.user.delete({
        where: { id },
        omit: { password: true },
      });
    } catch (error: unknown) {
      // Prisma error code for "Record to delete does not exist"
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error as Prisma.PrismaClientKnownRequestError).code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error; // Rethrow any other unexpected database errors
    }
  }
}
