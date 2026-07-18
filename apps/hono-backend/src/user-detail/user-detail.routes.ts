import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { eq } from 'drizzle-orm';
import { db } from '../db'; // Adjust path to your Drizzle db instance
import { userDetail } from '../../drizzle/schema';
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

  // Fetch detailed information for the user
  const [detailRecord] = await db
    .select()
    .from(userDetail)
    .where(eq(userDetail.userId, userId))
    .limit(1);

  if (!detailRecord) {
    throw new HTTPException(404, {
      message: `User detail with ID ${userId} not found`,
    });
  }

  return c.json(detailRecord);
});

// 2. GET /premium/:userId (Optimized check returning only premium state fields)
userDetailApp.get('/premium/:userId', userOwnershipMiddleware, async (c) => {
  const userId = c.req.param('userId');

  // Select only the requested premium state columns for optimal query performance
  const [premiumStatus] = await db
    .select({
      isPremium: userDetail.isPremium,
      membershipStart: userDetail.membershipStart,
      membershipEnd: userDetail.membershipEnd,
    })
    .from(userDetail)
    .where(eq(userDetail.userId, userId))
    .limit(1);

  if (!premiumStatus) {
    throw new HTTPException(404, {
      message: `Premium status for user ${userId} not found`,
    });
  }

  return c.json(premiumStatus);
});

// 3. POST / (Create user details)
userDetailApp.post(
  '/',
  zValidator('json', createUserDetailSchema),
  async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const targetUserId = body.userId || user.userId;

    // Enforce security check: prevent spoofing details for other user ids
    if (user.userId !== targetUserId && !user.isAdmin) {
      throw new HTTPException(403, {
        message: 'You can only create details for your own profile.',
      });
    }

    const [newDetail] = await db
      .insert(userDetail)
      .values({
        id: crypto.randomUUID(),
        userId: targetUserId,
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
        // Store date of birth as an ISO string or null if not provided
        dateOfBirth: body.dateOfBirth
          ? new Date(body.dateOfBirth).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      })
      .returning();

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

    // 1. Build a clean update object containing only fields that were actually passed
    const updateFields: Record<string, any> = {};

    const fieldKeys = [
      'displayName',
      'avatarUrl',
      'bio',
      'preferredLanguage',
      'addressLine1',
      'addressLine2',
      'city',
      'stateProvince',
      'postalCode',
      'countryCode',
      'iban',
      'bic',
      'taxId',
    ] as const;

    for (const key of fieldKeys) {
      if (updateData[key] !== undefined) {
        updateFields[key] = updateData[key];
      }
    }

    // Handle dateOfBirth conversion if provided in the update body
    if (updateData['dateOfBirth'] !== undefined) {
      updateFields['dateOfBirth'] = updateData.dateOfBirth
        ? new Date(updateData.dateOfBirth).toISOString()
        : null;
    }

    // Always refresh active and updated timestamps
    updateFields['lastActiveAt'] = new Date().toISOString();
    updateFields['updatedAt'] = new Date().toISOString();

    // 2. Execute update against userDetail table
    const [updatedDetail] = await db
      .update(userDetail)
      .set(updateFields)
      .where(eq(userDetail.userId, userId))
      .returning();

    if (!updatedDetail) {
      throw new HTTPException(404, {
        message: `User detail with ID ${userId} not found`,
      });
    }

    return c.json(updatedDetail);
  },
);

// 5. DELETE /:userId (Delete details)
userDetailApp.delete('/:userId', userOwnershipMiddleware, async (c) => {
  const userId = c.req.param('userId');

  try {
    // Execute delete query and return the deleted row(s)
    const [deletedRecord] = await db
      .delete(userDetail)
      .where(eq(userDetail.userId, userId))
      .returning();

    // If no row was matched and deleted, throw a 404 error
    if (!deletedRecord) {
      throw new HTTPException(404, {
        message: `User detail with ID ${userId} not found.`,
      });
    }

    return c.json(deletedRecord);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, {
      message: 'Failed to delete user details',
      cause: error,
    });
  }
});

export default userDetailApp;
