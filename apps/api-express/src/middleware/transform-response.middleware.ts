import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@book-store-2026/libs';

const isAlreadyWrapped = (body: unknown): boolean =>
  typeof body === 'object' &&
  body !== null &&
  'data' in body &&
  'timestamp' in body &&
  'statusCode' in body;

/**
 * Express equivalent of the NestJS TransformInterceptor: wraps every successful
 * JSON response in the ApiResponse envelope { data, timestamp, statusCode }.
 *
 * Error responses (status >= 400) are left untouched, mirroring NestJS where
 * exceptions bypass the interceptor. Set `res.locals.skipTransform = true` to
 * opt out of wrapping for a specific response.
 */
export const transformResponseMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalJson = res.json.bind(res);

  res.json = (body?: unknown): Response => {
    if (
      res.locals['skipTransform'] ||
      res.statusCode >= 400 ||
      isAlreadyWrapped(body)
    ) {
      return originalJson(body);
    }

    const envelope: ApiResponse<unknown> = {
      data: body ?? null,
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
    };

    return originalJson(envelope);
  };

  next();
};
