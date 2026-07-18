import { Request, Response, NextFunction } from 'express';

export const userOwnershipMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  // Triggers dynamically on endpoints using ':userId' in the path
  const targetUserId = req.params['userId'];

  // If the route doesn't have a ':userId' parameter, pass through safely
  if (!targetUserId) {
    return next();
  }

  // If there is a userId param, but it doesn't match the authenticated token (and user is not an admin), block it
  if (!user || (user.userId !== targetUserId && !user.isAdmin)) {
    res.status(403).json({
      message: 'You can only access your own data.',
    });
    return;
  }

  return next();
};
