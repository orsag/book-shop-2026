import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { SanitizeMiddleware } from '../middleware/sanitize.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { UserDetailModule } from '../user-detail/user-detail.module';
import { UploadsModule } from '../uploads/uploads.module';
import { ProductsModule } from '../product/products.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    OrderModule,
    UserDetailModule,
    UploadsModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // 1. Logging applies to EVERYTHING
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })

      // 2. Sanitization ONLY applies to methods with request bodies
      .apply(SanitizeMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
      );
  }
}
