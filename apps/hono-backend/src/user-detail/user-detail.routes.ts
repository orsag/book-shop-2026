import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { Prisma } from '@prismalib';
import { db } from '../prisma/prisma.service';
import { HonoEnv } from '../guards/types';
import { jwtAuthMiddleware } from '../guards/auth.middleware';
import { userOwnershipMiddleware } from '../guards/ownership.middleware';
import {
  createUserDetailSchema,
  updateUserDetailSchema,
} from './user-detail.schema';

const userDetailApp = new Hono<HonoEnv>();

// Apply JWT authentication globally to all user-detail routes
userDetailApp.use('/*', jwtAuthMiddleware);

// --- ROUTES ---

// 1. GET /:userId (Find detailed info)
userDetailApp.get('/:userId', userOwnershipMiddleware, async (c) => {
  const userId = c.req.param('userId');

  const userDetail = await db.userDetail.findUnique({
    where: { userId },
  });

  if (!userDetail) {
    throw new HTTPException(404, {
      message: `User detail with ID ${userId} not found`,
    });
  }

  return c.json(userDetail);
});

// 2. GET /premium/:userId (Optimized check returning only premium state fields)
userDetailApp.get('/premium/:userId', userOwnershipMiddleware, async (c) => {
  const userId = c.req.param('userId');

  const userDetail = await db.userDetail.findUnique({
    where: { userId },
    select: {
      isPremium: true,
      membershipStart: true,
      membershipEnd: true,
    },
  });

  if (!userDetail) {
    throw new HTTPException(404, {
      message: `Premium status for user ${userId} not found`,
    });
  }

  return c.json(userDetail);
});

// 3. POST / (Create user details)
userDetailApp.post(
  '/',
  zValidator('json', createUserDetailSchema),
  async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');

    // Enforce security check: prevent spoofing details for other user ids
    if (user.userId !== body.userId && !user.isAdmin) {
      throw new HTTPException(403, {
        message: 'You can only create details for your own profile.',
      });
    }

    const newDetail = await db.userDetail.create({
      data: {
        userId: body.userId,
        displayName: body.displayName,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
        preferredLanguage: body.preferredLanguage,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        stateProvince: body.stateProvince,
        postalCode: body.postalCode,
        countryCode: body.countryCode,
        iban: body.iban,
        bic: body.bic,
        taxId: body.taxId,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      },
    });

    return c.json(newDetail, 201);
  },
);

// 4. PATCH /:userId (Update user details)
userDetailApp.patch(
  '/:userId',
  userOwnershipMiddleware,
  zValidator('json', updateUserDetailSchema),
  async (c) => {
    const userId = c.req.param('userId');
    const updateData = c.req.valid('json');

    const updatedDetail = await db.userDetail.update({
      where: { userId },
      data: {
        displayName: updateData.displayName,
        avatarUrl: updateData.avatarUrl,
        bio: updateData.bio,
        preferredLanguage: updateData.preferredLanguage,
        addressLine1: updateData.addressLine1,
        addressLine2: updateData.addressLine2,
        city: updateData.city,
        stateProvince: updateData.stateProvince,
        postalCode: updateData.postalCode,
        countryCode: updateData.countryCode,
        iban: updateData.iban,
        bic: updateData.bic,
        taxId: updateData.taxId,
        lastActiveAt: new Date(), // Always refresh active timestamp
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined, // Safe date transform
      },
    });

    return c.json(updatedDetail);
  },
);

// 5. DELETE /:userId (Delete details)
userDetailApp.delete('/:userId', userOwnershipMiddleware, async (c) => {
  const userId = c.req.param('userId');

  try {
    const deleted = await db.userDetail.delete({
      where: { userId },
    });
    return c.json(deleted);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025' // Record not found
    ) {
      throw new HTTPException(404, {
        message: `User detail with ID ${userId} not found.`,
      });
    }
    throw error;
  }
});

export default userDetailApp;
