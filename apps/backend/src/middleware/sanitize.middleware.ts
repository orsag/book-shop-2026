// sanitize.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = DOMPurify.sanitize(obj[key]);
      } else if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        this.sanitizeObject(obj[key]);
      }
    }
    return obj;
  }
}
