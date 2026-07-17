import { Request, Response, NextFunction } from 'express';

export const userOwnershipMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  // Triggers dynamically on endpoints using ':userId' in the path[cite: 9]
  const targetUserId = req.params['userId'];

  // If the route doesn't have a ':userId' parameter, pass through safely[cite: 9]
  if (!targetUserId) {
    return next();
  }

  // If there is a userId param, but it doesn't match the authenticated token (and user is not an admin), block it[cite: 9]
  if (!user || (user.userId !== targetUserId && !user.isAdmin)) {
    res.status(403).json({
      message: 'You can only access your own data.',
  });
    return;
  }

  return next();
};