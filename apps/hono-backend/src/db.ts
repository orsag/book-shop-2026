import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env['HONO_DATABASE_URL'];

if (!connectionString) {
  throw new Error(
    'HONO_DATABASE_URL is not defined in the environment variables',
  );
}

// Drizzle uses a driver (postgres.js) to manage the connection
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
