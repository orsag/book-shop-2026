import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDetailService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const userDetail = await this.prisma.client.userDetail.findUnique({
      where: { userId: userId },
    });

    if (!userDetail) {
      throw new NotFoundException(`User detail with ID ${userId} not found`);
    }

    return userDetail;
  }

  async findPremiumStatus(userId: string) {
    const userDetail = await this.prisma.client.userDetail.findUnique({
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
    return this.prisma.client.userDetail.update({
      where: { userId },
      data: {
        ...updateData,
        // If you need to manually force a conversion for any reason:
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      },
    });
  }

  create(createUserDetailDto: CreateUserDetailDto) {
    console.log(JSON.stringify(createUserDetailDto));
    return 'This action adds a new userDetail';
  }

  findAll() {
    return `This action returns all userDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} userDetail`;
  }
}
