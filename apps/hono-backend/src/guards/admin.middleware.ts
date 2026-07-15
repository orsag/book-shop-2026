import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from './types';
import { securityLogger } from './logger.middleware';

// --- ADMIN GUARD MIDDLEWARE (Replaces AdminGuard) ---
export const adminMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const user = c.get('user');

  // Mimic your NestJS AdminGuard logic
  if (!user || !user.isAdmin) {
    securityLogger.error(
      {
        event: 'FORBIDDEN_ACCESS',
        userId: user?.userId || 'anonymous',
        path: c.req.path,
        attemptedAction: 'ADMIN_ACCESS_DENIED',
      },
      'User attempted to access admin route without sufficient privileges',
    );

    throw new HTTPException(403, { message: 'Admin resource. Access denied.' });
  }

  await next();
};