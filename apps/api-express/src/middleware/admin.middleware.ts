import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  // Mimic your NestJS AdminGuard logic
  if (!user || !user.isAdmin) {
    // Consistently return a 403 Forbidden
    res.status(403).json({
      message: 'Admin resource. Access denied.'
  });
    return; // Explicitly exit to satisfy TS7030
  }

  return next(); // Pass control cleanly to the next middleware or controller
};