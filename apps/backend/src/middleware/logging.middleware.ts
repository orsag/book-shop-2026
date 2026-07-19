import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

// Kept exported so your error middleware can use it for error logging
export const pinoLogger = pino({
  transport:
    process.env['NODE_ENV'] !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    // Fire the 'finish' event when response headers and body are sent to the OS
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
  }
}
