import { Request, Response, NextFunction } from 'express';
import { pinoLogger } from './logging.middleware';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the detailed error stack using your newly configured Pino logger!
  pinoLogger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        statusCode,
      },
      url: req.originalUrl,
    },
    'Unhandled exception occurred',
  );

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message:
      process.env['NODE_ENV'] === 'production'
        ? 'An unexpected error occurred'
        : message,
  });
};
