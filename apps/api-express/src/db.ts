import { prisma } from '@prismalib';

// Replicate NestJS OnModuleInit logic
export async function connectDatabase() {
  console.log('Connecting to DB:', process.env['DATABASE_URL']);
  try {
    // Safely call the connection helper
    await (prisma as any).$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error(
      '❌ Database connection failed:',
      JSON.stringify(error, null, 2)
    );
    throw error; // Stop server startup if DB is down
  }
}

// Replicate NestJS OnModuleDestroy logic
export async function disconnectDatabase() {
  console.log('Disconnecting database...');
  await (prisma as any).$disconnect();
}