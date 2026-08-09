import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { UserDetailModule } from '../user-detail/user-detail.module';
import { UserModule } from '../user/user.module';
import { UploadsModule } from '../uploads/uploads.module';
import { ProductsModule } from '../product/products.module';
import { VideoModule } from '../video/video.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { TransformInterceptor } from '../../interceptors/transform.interceptor';
import { TimeoutInterceptor } from '../../interceptors/timeout.interceptor';
import { NotFoundExceptionFilter } from '../../filters/not-found.filter';
import { PrismaExceptionFilter } from '../../filters/prisma-exception.filter';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    OrderModule,
    UserDetailModule,
    UserModule,
    UploadsModule,
    ProductsModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
