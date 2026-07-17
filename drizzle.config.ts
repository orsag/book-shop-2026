import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '.env') });

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/hono-backend/src/schema.ts', // Where you want the generated file to go
  out: './apps/hono-backend/drizzle', // Where migration files will be stored
  dbCredentials: {
    url: process.env['HONO_DATABASE_URL']!,
  },
});
