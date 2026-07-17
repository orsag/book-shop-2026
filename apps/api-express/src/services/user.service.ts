import { prisma, Prisma } from '@prismalib';
import { CreateUserDetailDto } from '../dto/create-user-detail.dto';
import { UpdateUserDetailDto } from '../dto/update-user-detail.dto';

export class UserService {
  async findOne(userId: string) {
    const userDetail = await prisma.userDetail.findUnique({
      where: { userId: userId },
  });

    if (!userDetail) {
      throw new Error(`User detail with ID ${userId} not found`);
    }

    return userDetail;
  }

  async findPremiumStatus(userId: string) {
    const userDetail = await prisma.userDetail.findUnique({
      where: { userId: userId },
    // Optimization: Only fetch the columns you actually need
    select: {
      isPremium: true,
      membershipStart: true,
      membershipEnd: true,
    },
  });

    if (!userDetail) {
      throw new Error(`Premium status for user ${userId} not found`);
    }

    return userDetail;
  }

  async update(userId: string, updateData: UpdateUserDetailDto) {
    return prisma.userDetail.update({
      where: { userId },
    data: {
    ...updateData,
      lastActiveAt: new Date(),
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

  async remove(userId: string) {
    try {
      return await prisma.userDetail.delete({
        where: { userId },
    });
    } catch (error: unknown) {
      // Prisma error code for "Record to delete does not exist"
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
        throw new Error(`User detail with ID ${userId} not found.`);
      }
      throw error; // Rethrow any other unexpected database errors
    }
  }
}