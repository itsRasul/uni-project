import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DatabaseExeptionFilter } from './common/filters/DatabaseException.filter';
import { HttpExceptionFilter } from './common/filters/HttpException.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerConfigService } from './common/configs/throttler.config';
import { typeORMConfigService } from './common/configs/typeORM.config';
import { CommonModule } from './common/common.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { AddressModule } from './address/address.module';
import { LikeModule } from './like/like.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { DiscountModule } from './discount/discount.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductImagesModule } from './product-images/product-images.module';
import { TransactionModule } from './transaction/transaction.module';
import { PaymentModule } from './payment/payment.module';
import { SettingModule } from './setting/setting.module';
import { CooperatorModule } from './cooperator/cooperator.module';
import { ShopModule } from './shop/shop.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ThrottlerConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeORMConfigService,
    }),
    AuthModule,
    UserModule,
    NotificationModule,
    CommonModule,
    CategoryModule,
    ProductModule,
    AddressModule,
    LikeModule,
    ReviewModule,
    CartModule,
    OrderModule,
    DiscountModule,
    ScheduleModule.forRoot(),
    ProductImagesModule,
    TransactionModule,
    PaymentModule,
    SettingModule,
    CooperatorModule,
    ShopModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DatabaseExeptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
