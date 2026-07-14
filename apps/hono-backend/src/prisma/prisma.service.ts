import { prisma, PrismaClient } from '../../../../prisma/prisma';

// Export the singleton client directly
export const db: PrismaClient = prisma;

export async function connectDb() {
  console.log('Connecting to DB:', process.env['DATABASE_URL']);
  try {
    await (db as any).$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error(
      '❌ Database connection failed:',
      JSON.stringify(error, null, 2),
    );
    process.exit(1);
  }
}
