// src/common/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prismalib';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal database error';

    // Handle specific Prisma error codes
    switch (exception.code) {
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = `Requested record not found (Prisma code: P2025)`;
        break;
      case 'P2002': // Unique constraint violation (e.g., duplicate email)
        statusCode = HttpStatus.CONFLICT;
        message = `A record with this field already exists (Prisma code: P2002)`;
        break;
      // Add other Prisma codes here as needed (e.g., foreign key constraints P2003)
    }

    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}
