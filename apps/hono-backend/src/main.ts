import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { connectDb } from './prisma/prisma.service';
import {
  logger as pinoLogger,
  securityLogger,
} from './guards/logger.middleware';

// Import your resource routers
import productApp from './product/product.routes';
import authApp from './auth/auth.routes';
import orderApp from './order/order.routes';
import userDetailApp from './user-detail/user-detail.routes';
import uploadsApp from './uploads/uploads.routes';
import { rateLimiter } from 'hono-rate-limiter';

// Load .env from the root of the monorepo
dotenv.config({ path: join(__dirname, '../../.env') });

const app = new Hono();

// 1. Setup Global Rate Limiter
app.use(
  '*',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-6', // standard headers for rate limit info
    keyGenerator: (c) => c.req.header('x-forwarded-for') || '127.0.0.1', // Use IP address
    handler: (c) => {
      // Log the security event when someone is blocked
      securityLogger.warn({
        event: 'RATE_LIMIT_EXCEEDED',
        ip: c.req.header('x-forwarded-for'),
        path: c.req.path
      }, 'Rate limit exceeded');

      return c.json({ message: 'Too many requests, please try again later.' }, 429);
    },
  })
);

// --- PINO LOGGING MIDDLEWARE ---
app.use('*', async (c, next) => {
  const start = Date.now();

  // Log the incoming request
  pinoLogger.info({
    method: c.req.method,
    url: c.req.url
  }, 'Incoming request');

  await next();

  // Log the response time
  const ms = Date.now() - start;
  pinoLogger.info({
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: `${ms}ms`
  }, 'Request completed');
});

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
