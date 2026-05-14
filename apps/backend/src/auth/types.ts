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
