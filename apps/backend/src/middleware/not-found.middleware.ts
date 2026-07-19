import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Customize your 404 response payload here
    response.status(404).json({
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: `Oops! The route ${request.method} ${request.url} does not exist.`,
    });
  }
}
