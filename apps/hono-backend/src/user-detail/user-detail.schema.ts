import { z } from 'zod';

// Replicating your real UpdateUserDetailDto fields
export const updateUserDetailSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(255).optional(),
  preferredLanguage: z.string().optional(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(), // Expected as ISO String from request
  taxId: z.string().optional(),
});

// CreateUserDetail can extend it or use a subset depending on your business requirements
export const createUserDetailSchema = updateUserDetailSchema.extend({
  userId: z.string().min(1, 'userId is required'),
});
