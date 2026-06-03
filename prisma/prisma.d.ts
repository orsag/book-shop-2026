import 'dotenv/config';
import { Prisma, ProductType, PrismaClient } from '../generated/prisma/client';
import type { ProductWhereInput } from '../generated/prisma/models/Product';
declare const prisma: import("../generated/prisma/internal/class").PrismaClient<never, Prisma.GlobalOmitConfig, import("@prisma/client/runtime/client").DefaultArgs>;
export { Prisma, ProductType, PrismaClient, ProductWhereInput, prisma };
