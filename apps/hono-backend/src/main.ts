import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { connectDb } from './prisma/prisma.service';

// Import your resource routers
import productApp from './product/product.routes';
import authApp from './auth/auth.routes';
import orderApp from './order/order.routes';
import userDetailApp from './user-detail/user-detail.routes';
import uploadsApp from './uploads/uploads.routes';

// Load .env from the root of the monorepo
dotenv.config({ path: join(__dirname, '../../.env') });

const app = new Hono();

// 1. Enable CORS so your Angular app can talk to it
app.use(
  '/*',
  cors({
    origin: 'http://localhost:4200', // Your Angular app's local port
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  }),
);

// 2. Simple Health Check
app.get('/', (c) => c.text('Hono is flying! 🚀'));

// --- Mount Your Resources (Like AppController) ---
app.route('/api/products', productApp);
app.route('/api/auth', authApp);
app.route('/api/order', orderApp);
app.route('/api/user-detail', userDetailApp);
app.route('/api/uploads', uploadsApp);

// 4. Start the Node Server
connectDb().then(() => {
  const port = Number(process.env['PORT']) || 3000;
  console.log(`Server is running on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
});

// 5. Export the Type for your Angular app (Hono RPC feature)
export type AppType = typeof app;
