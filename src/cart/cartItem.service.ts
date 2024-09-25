import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CartItem } from './entities/cartItem.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
  ) {}

  async createCartItem(dto: Omit<CartItem, 'id'>) {
    // i was forced use queryBuilder to create new record, because cart_id doesn't persist to db
    const result = await this.cartItemRepo
      .createQueryBuilder('cartItem')
      .insert()
      .into(CartItem)
      .values({
        cart: dto.cart,
        product: dto.product,
        quantity: dto.quantity,
      })
      .execute();

    const cartItem = await this.cartItemRepo.findOne({
      where: {
        id: result.identifiers[0].id,
      },
      relations: ['product', 'cart'],
    });

    return cartItem;
  }

  async deleteCartItem(product: Product) {
    const cartItem = await this.cartItemRepo.findOne({
      where: {
        product: {
          id: product.id,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('cart item is not found by this product id');
    }

    return await this.cartItemRepo.remove(cartItem);
  }

  async checkNotExistCartItemWithProductIdBelongingToUser(
    cartItemIds: CartItem[],
    product: Product,
  ): Promise<boolean> {
    console.log({ cartItemIds });
    const cartItem = await this.cartItemRepo.findOne({
      where: {
        id: In(cartItemIds.map((cartItem: CartItem) => cartItem.id)),
        product: {
          id: product.id,
        },
      },
    });

    if (cartItem) {
      throw new ConflictException('the product is already in your cart');
    }

    return false;
  }

  async deleteAllCartItemsWithTheseIds(cartItems: CartItem[]) {
    const ids = cartItems.map((cartItem) => cartItem.id);

    if (!ids.length) {
      return [];
    }
    const cartItemsToRemove = await this.cartItemRepo
      .createQueryBuilder('cart_items')
      .where(`cart_items.id IN (:...ids)`, { ids })
      .getMany();

    return await this.cartItemRepo.remove(cartItemsToRemove);
  }
}
