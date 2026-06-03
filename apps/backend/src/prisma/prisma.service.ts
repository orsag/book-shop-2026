/* eslint-disable */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Import from your specific generated path
import { prisma, PrismaClient } from '@prismalib';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Use public so you can access it via prismaService.client
  public client: PrismaClient;

  constructor() {
    // Initialize the client here
    this.client = prisma;
  }

  async onModuleInit() {
    console.log('Connecting to DB:', process.env['DATABASE_URL']);
    try {
      // In some custom/adapter setups, $connect is internal.
      // We call it safely:
      await (this.client as any).$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }
}
