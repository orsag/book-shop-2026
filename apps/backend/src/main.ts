import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { join, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NotFoundExceptionFilter } from './middleware/not-found.middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Load .env from the root of the monorepo
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Custom logger to suppress verbose route mapping and dependency loading logs
 */
class QuietLogger extends ConsoleLogger {
  override log(message: string, context?: string) {
    if (context === 'RouterExplorer' || context === 'RoutesResolver' || context === 'InstanceLoader') {
      return; // Suppress these specific contexts
    }
    super.log(message, context);
  }

  override warn(message: string, context?: string) {
    if (context === 'LegacyRouteConverter') {
      return; // Suppress the path-to-regexp asterisk warnings too if desired
    }
    super.warn(message, context);
  }
}

async function bootstrap() {
  // 2. Add the Generic Type here <NestExpressApplication>
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new QuietLogger(),
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 1. Get the path from .env (e.g., "../../development/images")
  const rawLocation = process.env['UPLOAD_LOCATION'];

  // 2. Resolve it relative to the Monorepo Root (where the app is running)
  const uploadPath = resolve(process.cwd(), rawLocation ?? '');


  app.useStaticAssets(uploadPath, {
    prefix: '/assets/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that aren't in the DTO
      forbidNonWhitelisted: true, // Throws error if extra properties are sent
      transform: true, // Automatically transforms payloads to match DTO types
    }),
  );

  // Bind the 404 filter globally
  app.useGlobalFilters(new NotFoundExceptionFilter());

  // Enable CORS so your Angular app can talk to the backend
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BookStore API')
    .setDescription('The API description for our BookStore')
    .setVersion('1.0')
    .addBearerAuth() // Optional: if you use JWT auth
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // This serves the interactive Swagger UI at /api-docs
  SwaggerModule.setup('api-docs', app, documentFactory);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
