import { Module } from '@nestjs/common';
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
export class AppModule {}
