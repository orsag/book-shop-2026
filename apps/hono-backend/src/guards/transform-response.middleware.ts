// src/guards/transform-response.middleware.ts
import { MiddlewareHandler } from 'hono';
import { ApiResponse } from '@store/libs';

const isAlreadyWrapped = (body: unknown): boolean =>
  typeof body === 'object' &&
  body !== null &&
  'data' in body &&
  'timestamp' in body &&
  'statusCode' in body;

/**
 * Hono equivalent of the NestJS TransformInterceptor: wraps every successful
 * JSON response in the ApiResponse envelope { data, timestamp, statusCode }.
 *
 * Error responses (status >= 400) are left untouched, mirroring NestJS where
 * exceptions bypass the interceptor. Set `c.set('skipTransform', true)` to opt
 * out of wrapping for a specific response.
 */
export const transformResponseMiddleware: MiddlewareHandler = async (c, next) => {
  const originalJson = c.json.bind(c);

  c.json = ((object: unknown, arg?: any, headers?: any): Response => {
    const statusCode =
      typeof arg === 'number' ? arg : (arg?.status ?? c.res.status);

    if (
      c.get('skipTransform' as any) ||
      statusCode >= 400 ||
      isAlreadyWrapped(object)
    ) {
      return originalJson(object, arg, headers);
    }

    const envelope: ApiResponse<unknown> = {
      data: object ?? null,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    return originalJson(envelope, arg, headers);
  }) as typeof c.json;

  await next();
};
