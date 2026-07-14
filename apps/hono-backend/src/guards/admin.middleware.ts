import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from './types';

// --- ADMIN GUARD MIDDLEWARE (Replaces AdminGuard) ---
export const adminMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const user = c.get('user');

  // Mimic your NestJS AdminGuard logic
  if (!user || !user.isAdmin) {
    throw new HTTPException(403, { message: 'Admin resource. Access denied.' });
  }

  await next();
};