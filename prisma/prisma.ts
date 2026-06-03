import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, ProductType, PrismaClient } from '../generated/prisma/client';
import type { ProductWhereInput  } from '../generated/prisma/models/Product';

const connectionString = `${process.env['DATABASE_URL']}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { Prisma, ProductType, PrismaClient, ProductWhereInput, prisma };
