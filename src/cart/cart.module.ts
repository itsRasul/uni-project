import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.entity';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { CartItemService } from './cartItem.service';
import { User } from 'src/user/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductModule, UserModule],
  providers: [CartService, CartItemService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
