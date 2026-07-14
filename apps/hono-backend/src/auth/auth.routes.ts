import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db } from '../prisma/prisma.service'; // Adjust path to your Prisma client
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { HonoEnv } from '../guards/types';

const authApp = new Hono<HonoEnv>();

// --- VALIDATION SCHEMAS (Replacing NestJS DTOs) ---
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

const updateFavoritesSchema = z.object({
  favorites: z.array(z.string()),
});

const updateProfileSchema = z.object({
  updates: z.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    theme: z.string().optional(),
  }),
});

// --- ROUTES ---

// 1. POST /login (Replaces AuthController.login)
authApp.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username } = c.req.valid('json');
  const normalizedUsername = username.toLowerCase();

  const user = await db.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (!user) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Create JWT Payload matching your original types.ts
  const payload = {
    sub: user.id,
    username: user.username,
    isAdmin: user.isAdmin, // Standard property from your user schema
    exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
  };

  const accessToken = await sign(payload, secret, 'HS256');

  // Update last login
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return c.json({
    user: updatedUser,
    access_token: accessToken,
  });
});

// 2. GET /logout (Replaces AuthController.logout)
authApp.get('/logout', jwtAuthMiddleware, async (c) => {
  const authenticatedUser = c.get('user'); // Pulled from the token by jwtAuthMiddleware
  const username = authenticatedUser.username.toLowerCase();

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  // Update last login / active timestamp
  await db.user.update({
    where: { username },
    data: { lastLogin: new Date() },
  });

  return c.json({
    message: `User ${authenticatedUser.username} logged out successfully`,
    timestamp: new Date(),
  });
});

// 3. GET / (Replaces AuthController.getUser)
authApp.get('/', async (c) => {
  const username = c.req.query('username');

  if (!username) {
    throw new HTTPException(400, {
      message: 'Username query parameter is required',
    });
  }

  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!user) {
    throw new HTTPException(404, { message: `User ${username} not found` });
  }

  return c.json(user);
});

// 4. PATCH /favorites (Replaces AuthController.updateFavorites)
authApp.patch(
  '/favorites',
  jwtAuthMiddleware,
  zValidator('json', updateFavoritesSchema),
  async (c) => {
    const authenticatedUser = c.get('user');
    const { favorites } = c.req.valid('json');

    const updatedUser = await db.user.update({
      where: { username: authenticatedUser.username.toLowerCase() },
      data: { favorites },
    });

    return c.json(updatedUser);
  },
);

// 5. PATCH /update (Replaces AuthController.updateProfile)
authApp.patch(
  '/update',
  jwtAuthMiddleware,
  zValidator('json', updateProfileSchema),
  async (c) => {
    const authenticatedUser = c.get('user');
    const { updates } = c.req.valid('json');

    const updatedUser = await db.user.update({
      where: { username: authenticatedUser.username.toLowerCase() },
      data: {
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        theme: updates.theme,
      },
    });

    return c.json(updatedUser);
  },
);

export default authApp;
