import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prismalib';

@Injectable()
export class UserDetailService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { userId: userId },
    });

    if (!userDetail) {
      throw new NotFoundException(`User detail with ID ${userId} not found`);
    }

    return userDetail;
  }

  async findPremiumStatus(userId: string) {
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { userId: userId },
      // Optimization: Only fetch the columns you actually need
      select: {
        isPremium: true,
        membershipStart: true,
        membershipEnd: true,
      },
    });

    // Handle the case where the user doesn't exist in the userDetail table
    if (!userDetail) {
      throw new NotFoundException(
        `Premium status for user ${userId} not found`,
      );
      // OR return a default object:
      // return { isPremium: false, membershipStart: null, membershipEnd: null };
    }

    return userDetail;
  }

  async update(userId: string, updateData: UpdateUserDetailDto) {
    return this.prisma.userDetail.update({
      where: { userId },
      data: {
        ...updateData,
        lastActiveAt: new Date(),
        // If you need to manually force a conversion for any reason:
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      },
    });
  }

  async create(createUserDetailDto: CreateUserDetailDto) {
    return this.prisma.userDetail.create({
      data: {
        ...createUserDetailDto,
        dateOfBirth: createUserDetailDto.dateOfBirth
          ? new Date(createUserDetailDto.dateOfBirth)
          : undefined,
        membershipStart: createUserDetailDto.membershipStart
          ? new Date(createUserDetailDto.membershipStart)
          : undefined,
        membershipEnd: createUserDetailDto.membershipEnd
          ? new Date(createUserDetailDto.membershipEnd)
          : undefined,
      },
    });
  }

  async remove(userId: string) {
    try {
      return await this.prisma.userDetail.delete({
        where: { userId },
      });
    } catch (error: unknown) {
      // Prisma error code for "Record to delete does not exist"
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error as Prisma.PrismaClientKnownRequestError).code === 'P2025'
      ) {
        throw new NotFoundException(`User detail with ID ${userId} not found.`);
      }
      throw error; // Rethrow any other unexpected database errors
    }
  }
}
