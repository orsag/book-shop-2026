import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { HonoEnv, JwtPayload } from '../guards/types';
import { eq } from 'drizzle-orm';
import { db } from '../db'; // Import your new Drizzle client
import { user } from '../schema';

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

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.username, normalizedUsername))
    .limit(1);

  if (!userData) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Create JWT Payload matching your original token
  const payload: JwtPayload = {
    sub: userData.id,
    username: userData.username,
    isAdmin: userData.isAdmin, // Standard property from your user schema
    exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
  };

  const accessToken = await sign(payload, secret, 'HS256');

  const [updatedUser] = await db
    .update(user)
    .set({ lastLogin: new Date().toISOString() })
    .where(eq(user.id, userData.id))
    .returning();

  return c.json({
    user: updatedUser,
    access_token: accessToken,
  });
});

// 2. GET /logout (Replaces AuthController.logout)
authApp.get('/logout', jwtAuthMiddleware, async (c) => {
  const authenticatedUser = c.get('user'); // Pulled from the token by jwtAuthMiddleware
  const normalizedUsername = authenticatedUser.username.toLowerCase();

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.username, normalizedUsername))
    .limit(1);

  if (!userData) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  // Update last login / active timestamp
  await db
    .update(user)
    .set({ lastLogin: new Date().toISOString() })
    .where(eq(user.id, userData.id));

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

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.username, username.toLowerCase()))
    .limit(1);

  if (!userData) {
    throw new HTTPException(404, { message: `User ${username} not found` });
  }

  return c.json(userData);
});

// 4. PATCH /favorites (Replaces AuthController.updateFavorites)
authApp.patch(
  '/favorites',
  jwtAuthMiddleware,
  zValidator('json', updateFavoritesSchema),
  async (c) => {
    const authenticatedUser = c.get('user');
    const { favorites } = c.req.valid('json');

    const [updatedUser] = await db
      .update(user)
      .set({ favorites })
      .where(eq(user.username, authenticatedUser.username.toLowerCase()))
      .returning();

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

    const [updatedUser] = await db
      .update(user)
      .set({
        ...(updates.email && { email: updates.email }),
        ...(updates.phoneNumber && { phoneNumber: updates.phoneNumber }),
        ...(updates.theme && { theme: updates.theme }),
      })
      .where(eq(user.username, authenticatedUser.username.toLowerCase()))
      .returning();

    return c.json(updatedUser);
  },
);

export default authApp;
