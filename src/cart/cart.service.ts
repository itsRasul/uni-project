import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartItemService } from './cartItem.service';
import { User } from '../user/User.entity';
import { CartItem } from './entities/cartItem.entity';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { DELIVERY_COST } from './constant';
import { ProductService } from 'src/product/product.service';
import { AddItemToMyCartDto } from './dtos/add-item-to-my-cart.dto';
import { Product } from 'src/product/entities/product.entity';
import { UpdateMyCartDto } from './dtos/update-my-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    private cartItemService: CartItemService,
    private productService: ProductService,
  ) {}

  async addProductToMyCart(currentUser: User, productId: number, body: AddItemToMyCartDto) {
    // 1) is there any cart for this
    // 2) if it is, then create new cartItem and add it to his cart
    // 3) if it isn't, create new cart then create new cartItem and add it to his cart

    const cart = await this.findByUserIdOrCreate(currentUser);

    const product = await this.productService.findBy({ id: productId });

    // check if stockQuantity is bigger than the quantity user wants
    if (body.quantity >= product.stockQuantity) {
      throw new ConflictException('the quantity must not be bigger than stock quantity');
    }

    // when cart is not found, it create new cart in this case new cart has not cartItems field in it, and the cartItems is undefind and we can't map to it, so we use cart.cartItems ?? [].map() syntax to handle it
    // const cartItemIdsBelongsToThisUser = cart.cartItems ?? [].map((cartItem) => cartItem.id);
    const cartItemIdsBelongsToThisUser = cart.cartItems ?? [];
    await this.cartItemService.checkNotExistCartItemWithProductIdBelongingToUser(
      cartItemIdsBelongsToThisUser,
      product,
    );

    const cartItem = await this.cartItemService.createCartItem({
      product,
      cart,
      quantity: body.quantity,
    });

    // calculate price and totalPrice

    const updatedCart = await this.findByUserIdOrCreate(currentUser);

    return await this.updateCartPrice(updatedCart);
  }

  async findByUserIdOrCreate(user: User): Promise<Cart> {
    let cart: Cart;

    cart = await this.cartRepo.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['cartItems', 'cartItems.product.images', 'cartItems.product.cover'],
    });

    if (!cart) {
      cart = await this.createCart(user);
    }

    // if after of adding a product, a discout is applied for the product, we should update cart before returning to user whenever user wants to see cart
    const updatedCart = await this.updateCartPrice(cart);

    return updatedCart;
  }

  async findByUserId(user: User) {
    const cart = await this.cartRepo.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['cartItems', 'cartItems.product.images', 'cartItems.product.cover'],
    });

    if (!cart) {
      throw new NotFoundException('cart is not found by this user id');
    }

    return cart;
  }

  async createCart(currentUser: User) {
    const createdCart = this.cartRepo.create({
      user: currentUser,
      deliveryCost: DELIVERY_COST,
    });

    const cart = await this.cartRepo.save(createdCart);

    return cart;
  }

  async save(cart: Cart) {
    return await this.cartRepo.save(cart);
  }

  async removeProductFromMyCart(currentUser: User, productId: number) {
    const cart = await this.findByUserIdOrCreate(currentUser);

    const product = await this.productService.findBy({ id: productId });

    const removedCartItem = await this.cartItemService.deleteCartItem(product);

    const updatedCart = await this.findByUserIdOrCreate(currentUser);

    return await this.updateCartPrice(updatedCart);
  }

  async clearAllItemsFromMyCart(currentUser: User) {
    // check if user has a cart or not
    const cart = await this.findByUserIdOrCreate(currentUser);

    // delete all cartItems from CartItem collection
    await this.cartItemService.deleteAllCartItemsWithTheseIds(cart.cartItems);

    const updatedCart = await this.findByUserIdOrCreate(currentUser);

    return await this.updateCartPrice(updatedCart);
  }

  async updateMyCart(currentUser: User, product: Product, body: UpdateMyCartDto) {
    const cart = await this.findByUserIdOrCreate(currentUser);

    const cartItem = await this.cartItemRepo.findOne({
      where: {
        product: {
          id: product.id,
        },
        cart: {
          id: cart.id,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(
        "cart item is not found by this product id, or it's belonging to you",
      );
    }

    cartItem.quantity = body.quantity;
    await this.cartItemRepo.save(cartItem);

    const updatedCart = await this.findByUserIdOrCreate(currentUser);

    // update cart price and total price
    await this.updateCartPrice(updatedCart);

    return cartItem;
  }

  async updateCartPrice(cart: Cart) {
    cart.totalPrice = cart.cartItems.reduce(
      (sum: number, current: CartItem) => sum + current.quantity * current.product.price,
      0,
    );

    const amoutPayable = cart.cartItems.reduce(
      (sum: number, current: CartItem) => sum + current.quantity * current.product.sellPrice,
      0,
    );

    cart.discountedPrice = cart.totalPrice - amoutPayable;
    cart.finalPrice = amoutPayable + cart.deliveryCost;
    cart.updatedAt = new Date();

    return await this.cartRepo.save(cart);
  }
}
