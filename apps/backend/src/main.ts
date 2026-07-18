import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { join, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { sanitizeObject } from './utils';

// Load .env from the root of the monorepo
dotenv.config({ path: join(__dirname, '../../.env') });

async function bootstrap() {
  // 2. Add the Generic Type here <NestExpressApplication>
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 1. Get the path from .env (e.g., "../../development/images")
  const rawLocation = process.env['UPLOAD_LOCATION'];

  // 2. Resolve it relative to the Monorepo Root (where the app is running)
  const uploadPath = resolve(process.cwd(), rawLocation ?? '');

  console.log('--- STATIC ASSET CHECK ---');
  console.log('Absolute path to images:', uploadPath);
  console.log('--------------------------');

  const port = process.env['PORT'] || 3000;

  app.useStaticAssets(uploadPath, {
    prefix: '/assets/',
  });

  app.use((req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that aren't in the DTO
      forbidNonWhitelisted: true, // Throws error if extra properties are sent
      transform: true, // Automatically transforms payloads to match DTO types
    }),
  );

  // Enable CORS so your Angular app can talk to the backend
  app.enableCors();

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
