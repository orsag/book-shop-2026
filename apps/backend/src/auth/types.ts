export interface JwtPayload {
  sub: string; // The user ID (Subject)
  username: string;
  email: string;
  isAdmin: boolean;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  email: string;
  isAdmin: boolean;
}
