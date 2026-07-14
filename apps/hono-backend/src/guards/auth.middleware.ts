import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { JwtPayload, AuthenticatedUser, HonoEnv } from './types'; // Import your types.ts

// --- JWT AUTH MIDDLEWARE (Replaces JwtStrategy & JwtAuthGuard) ---
export const jwtAuthMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Unauthorized: Missing or invalid token format',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    // Verifies signature and check exp date automatically
    const payload = (await verify(token, secret, {
      alg: 'HS256',
    })) as unknown as JwtPayload;

    // Mimic your JwtStrategy validate() method to construct the AuthenticatedUser
    const authenticatedUser: AuthenticatedUser = {
      userId: payload.sub,
      username: payload.username,
      isAdmin: payload.isAdmin,
    };

    // Attach user to context so down-stream routes/guards can access it (equivalent to request.user)
    c.set('user', authenticatedUser);

    await next();
  } catch (err) {
    throw new HTTPException(401, { message: 'Unauthorized: Invalid token' });
  }
};
