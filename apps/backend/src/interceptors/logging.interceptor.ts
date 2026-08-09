// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import pino from 'pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private pinoLogger = pino({
    transport:
      process.env['NODE_ENV'] !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  }); // Or use a custom Pino/Winston logger service

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.pinoLogger.info(
            {
              method: req.method,
              url: `[HTTP] ${method} ${url} - ${Date.now() - now}ms`,
              status: res.statusCode,
            },
            'LoggingInterceptor',
          ),
        error: (err) =>
          this.pinoLogger.info(
            {
              method: req.method,
              url: `[HTTP] ${method} ${url} - ${Date.now() - now}ms`,
              status: err.statusCode,
            },
            'LoggingInterceptor',
          ),
      }),
    );
  }
}
