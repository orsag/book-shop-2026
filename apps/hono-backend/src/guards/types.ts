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

// 1. Setup global type declaration for Hono Context Variables
export type MyEnvVariables = {
  user: AuthenticatedUser;
};

export type HonoEnv = {
  Variables: MyEnvVariables;
};
