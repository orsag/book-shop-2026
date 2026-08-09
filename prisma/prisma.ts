import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, ProductType, PrismaClient } from '../generated/prisma/client';
import type { ProductWhereInput } from '../generated/prisma/models/Product';

const connectionString = `${process.env['DATABASE_URL']}`;

export type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

const adapter = new PrismaPg({ connectionString });

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    omit: { user: { password: true } },
  });
};

export {
  adapter,
  Prisma,
  ProductType,
  PrismaClient,
  ProductWhereInput,
  prismaClientSingleton,
};
