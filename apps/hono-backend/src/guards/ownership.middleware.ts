import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from './types';

export const userOwnershipMiddleware: MiddlewareHandler<HonoEnv> = async (
  c,
  next,
) => {
  const user = c.get('user');

  // Triggers dynamically on endpoints using ':userId'
  const targetUserId = c.req.param('userId');

  // If the route doesn't have a ':userId' parameter, pass through
  if (!targetUserId) {
    await next();
    return;
  }

  // If there is a userId param, but it doesn't match the authenticated token (and user is not an admin), block it
  if (!user || (user.userId !== targetUserId && !user.isAdmin)) {
    throw new HTTPException(403, {
      message: 'You can only access your own data.',
    });
  }

  await next();
};
