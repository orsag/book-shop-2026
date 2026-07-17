import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

// Initialize the Pino logger (can be configured with pretty-printing in development)
export const pinoLogger = pino({
  transport:
    process.env['NODE_ENV'] !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Express fires the 'finish' event when the response headers and body have been sent to the OS
  res.on('finish', () => {
    const ms = Date.now() - start;

    pinoLogger.info(
      {
        method: req.method,
        url: req.originalUrl || req.url, // originalUrl preserves the /api prefix
        status: res.statusCode,
        duration: `${ms}ms`,
      },
      'Request completed',
    );
  });

  next();
};
