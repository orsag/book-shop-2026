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

    const logRequest = () => {
      res.removeListener('finish', logRequest);
      res.removeListener('close', logRequest);

      const ms = Date.now() - start;
      pinoLogger.info(
        {
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          duration: `${ms}ms`,
        },
        'Request completed',
      );
    };

    res.on('finish', logRequest);
    res.on('close', logRequest);

    next();
  }
}
