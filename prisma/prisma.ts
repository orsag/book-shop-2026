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

// 1. Define global type to prevent TypeScript errors
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

// 2. Export a single shared instance evaluated lazily
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

export {
  prisma,
  adapter,
  Prisma,
  ProductType,
  PrismaClient,
  ProductWhereInput,
  prismaClientSingleton,
};
