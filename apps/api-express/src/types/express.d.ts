import { JwtPayload } from 'jsonwebtoken';
import { ProductType } from '@store/libs';

export interface UserPayload extends JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface FindAllParams {
  type: ProductType;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc';
  isDiscounted?: boolean;
}

export interface JwtPayload {
  sub: string; // The user ID (Subject)
  username: string;
  isAdmin: boolean;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  isAdmin: boolean;
}

// 🚀 Modern ES6 Module Augmentation (Eslint-Friendly)
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
