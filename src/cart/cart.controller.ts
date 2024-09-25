import { Get, Body, Param, Post, Delete, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemService } from './cartItem.service';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { User } from '../user/User.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AddItemToMyCartDto } from './dtos/add-item-to-my-cart.dto';
import { UpdateMyCartDto } from './dtos/update-my-cart.dto';

@Controller('/api/v1')
export class CartController {
  constructor(
    private cartService: CartService,
    private cartItemService: CartItemService,
    private productService: ProductService,
  ) {}

  @Delete('/carts/cartItems')
  @UseGuards(AuthGuard)
  async clearAllItemsFromMyCart(@CurrentUser() currentUser: User) {
    const cart = await this.cartService.clearAllItemsFromMyCart(currentUser);

    return {
      status: 'success',
      message: 'your all cartItems are removed successfully',
      data: {
        cart,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Post('/carts/products/:productId')
  async addToCart(
    @CurrentUser() currentUser: User,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: AddItemToMyCartDto,
  ) {
    const cart = await this.cartService.addProductToMyCart(currentUser, productId, body);

    return {
      status: 'success',
      message: 'product is added to your cart successfully',
      data: {
        cart,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Delete('/carts/products/:productId')
  async removeFromCart(
    @CurrentUser() currentUser: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const cart = await this.cartService.removeProductFromMyCart(currentUser, productId);

    return {
      status: 'success',
      message: 'product is removed from your cart successfully',
      data: {
        cart,
      },
    };
  }

  @Get('/carts')
  @UseGuards(AuthGuard)
  async getMyCart(@CurrentUser() currentUser: User) {
    const cart = await this.cartService.findByUserIdOrCreate(currentUser);

    return {
      status: 'success',
      message: 'your cart is received successfully',
      data: {
        cart,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Patch('/carts/products/:productId')
  async updateMyCart(
    @CurrentUser() currentUser: User,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateMyCartDto,
  ) {
    const product = await this.productService.findBy({ id: productId });
    const cartItem = await this.cartService.updateMyCart(currentUser, product, body);

    return {
      status: 'success',
      message: 'your cart item is updated successfully',
      data: {
        cartItem,
      },
    };
  }
}
