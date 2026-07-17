import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AuthenticatedUser } from '../types/express';

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  // Verify the Authorization header presence and prefix
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env['JWT_SECRET'];

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    // Verifies signature and expiration automatically
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'], // Enforce HS256 algorithm matching your original code
    }) as unknown as JwtPayload;

    // Mimic the AuthenticatedUser construction
    const authenticatedUser: AuthenticatedUser = {
      userId: decoded.sub,     // Maps sub to userId
      username: decoded.username,
    isAdmin: decoded.isAdmin,
  };

    // Attach user to request context so downstream routes can access it
    req.user = authenticatedUser;

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};