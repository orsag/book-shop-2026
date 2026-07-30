/* eslint-disable */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Import from your specific generated path
import { prisma, PrismaClient } from '@prismalib';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;
  private connected = false;

  constructor() {
    this.client = prisma;
  }

  async onModuleInit() {
    if (this.connected) {
      return;
    }

    console.log('Connecting to DB:', process.env['DATABASE_URL']);
    try {
      await (this.client as any).$connect();
      this.connected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error(
        '❌ Database connection failed:',
        JSON.stringify(error, null, 2)
      );
    }
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
    this.connected = false;
  }
}
