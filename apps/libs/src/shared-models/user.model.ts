import type { Request } from 'express';

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl: string;
  phoneNumber: string;
  theme: string;
  favorites: string[];
  lastLogin?: Date;
  cartItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFix {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  phoneNumber: string | null;
  theme: string;
  favorites: string[];
  cartItems: string[];
  lastLogin: Date | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<User, 'id'>;

// Define the shape of your JWT payload
export interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    isAdmin: boolean;
    // add other properties from your JWT payload here
  };
}

export type UserWithoutId = Omit<
  User,
  | 'id'
  | 'favorites'
  | 'isAdmin'
  | 'lastLogin'
  | 'cartItems'
  | 'createdAt'
  | 'updatedAt'
  | 'avatarUrl'
>;

export type UserDetailSmall = Omit<
  UserDetail,
  | 'id'
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'stateProvince'
  | 'isPremium'
  | 'membershipStart'
  | 'membershipEnd'
  | 'lastActiveAt'
> & {
  preferredLanguage: string;
  displayName: string;
  city: string;
  bio: string;
  avatarUrl: string;
  addressLine2: string;
  postalCode: string;
  iban: string;
  bic: string;
  taxId: string;
};

export interface UserDetail {
  id: string;
  userId: string;

  // Personalization
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferredLanguage: string; // default: "en"

  // Membership
  isPremium: boolean; // default: false
  membershipStart: Date | string | null;
  membershipEnd: Date | string | null;

  // Normalized Address Fields
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string | null;
  postalCode: string | null;
  countryCode: string; // ISO 3166-1 alpha-2

  // Banking
  iban: string | null;
  bic: string | null;
  dateOfBirth: Date | string | null;
  taxId: string | null;

  lastActiveAt: Date | string;

  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PremiumStatus {
  isPremium: boolean;
  membershipStart: Date | null;
  membershipEnd: Date | null;
}

// Initialisation
export const EMPTY_USER: UserWithoutId = {
  username: '',
  email: '',
  phoneNumber: '',
  theme: 'light',
};
