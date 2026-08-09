/* eslint-disable */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Import from your specific generated path
import { adapter, PrismaClient } from '@prismalib';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private connected = false;

  constructor() {
    super({
      adapter,
      omit: { user: { password: true } },
    });
  }

  async onModuleInit() {
    if (this.connected) {
      return;
    }

    console.log('Connecting to DB:', process.env['DATABASE_URL']);
    try {
      await this.$connect();
      this.connected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error(
        '❌ Database connection failed:',
        JSON.stringify(error, null, 2),
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.connected = false;
  }
}
