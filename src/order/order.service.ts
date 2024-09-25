import { productStatusEnum } from './../product/enums/productStatus.enum';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Injectable, NotFoundException, Body } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { UpdateShippingInfoDto } from './dtos/update-shipping-info.dto';
import { User } from 'src/user/User.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart/entities/cartItem.entity';
import { OrderItem } from './entities/orderItems.entity';
import { ProductService } from 'src/product/product.service';
import { orderStatusEnum } from './enums/orderStatus.enum';
import { Address } from 'src/address/entities/address.entity';
import { ShippingInfo } from './entities/shippingInfo.entity';
import { shippingCarrierEnum } from './enums/shippingCarrier.enum';
import { shippingInfoStatusEnum } from './enums/shippingInfoStatus.enum';
import { OrderQueryStringDto } from './dtos/order-query-string.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(ShippingInfo) private shippingInfoRepo: Repository<ShippingInfo>,
    private productService: ProductService,
  ) {}

  async getAllOrders(queryString: OrderQueryStringDto) {
    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.shippingInfo', 'shippingInfo');
    const feature = new QueryHelper<Order>(query, queryString, 'order')
      .sort()
      .paginate()
      .limit()
      .fields()
      .filter();

    const orders = await feature
      .getQuery()
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('shippingInfo.address', 'address')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .getMany();

    return orders;
  }

  async findBy(dto: FindOptionsWhere<Order>) {
    const order = await this.orderRepo.findOne({
      where: dto,
      relations: ['orderItems', 'shippingInfo.address', 'user', 'transactions', 'orderItems.product.images'],
    });

    if (!order) {
      throw new NotFoundException('order is not found by this id');
    }

    return order;
  }

  async count(dto: FindOptionsWhere<Order> = {}) {
    return await this.orderRepo.count({ where: dto });
  }

  async getAllMyOrders(user: User, queryString: any) {
    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.shippingInfo', 'shippingInfo')
      .leftJoinAndSelect('order.transactions', 'transactions')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .where('order.user.id = :userId', { userId: user.id });
    const feature = new QueryHelper<Order>(query, queryString, 'order')
      .sort()
      .paginate()
      .limit()
      .filter()
      .fields();

    const orders = await feature.getQuery().getMany();

    return orders;
  }

  async deleteOrder(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('order is not found by this id');
    }

    const removedOrder = await this.orderRepo.remove(order);

    return removedOrder;
  }

  async createOrderForGateway(
    cartItems: CartItem[],
    cart: Cart,
    currentUser: User,
    address: Address,
  ): Promise<Order> {
    // create orderItems from cartItems we recieved in arguments
    const orderItems = await this.insertManyOrderItems(cartItems);

    // create shipping info
    const shippingInfo = await this.createShippingInfo({
      address: address,
      shippingCarrier: shippingCarrierEnum.POST,
      shippingCost: cart.deliveryCost,
      trackingNumber: 1,
      status: shippingInfoStatusEnum.PROCESSING,
      // estimateDeliveryDate: new Date(),
    });

    // create new order using orderItems we just created, also cart we recieved, and the currentUser we recieved
    const createdOrder = this.orderRepo.create({
      user: currentUser,
      totalPrice: cart.totalPrice,
      finalPrice: cart.finalPrice,
      orderItems: orderItems,
      status: orderStatusEnum.PENDING,
      shippingInfo: shippingInfo,
    });

    const order = await this.orderRepo.save(createdOrder);

    return order;
  }

  async insertManyOrderItems(cartItems: CartItem[]) {
    // create orderItems using cartItems we recieved
    const orderItems: OrderItem[] = [];

    await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await this.productService.findBy({
          id: cartItem.product.id,
        });

        if (!product) {
          throw new NotFoundException('product is not fount by this id');
        }

        const orderItem = this.orderItemRepo.create({
          product: cartItem.product,
          price: product.price,
          finalPrice: product.sellPrice,
        });

        orderItems.push(orderItem);
      }),
    );

    return this.orderItemRepo.save(orderItems);
  }

  async createShippingInfo(body: Partial<ShippingInfo>) {
    const createdShippingInfo = this.shippingInfoRepo.create(body);

    return await this.shippingInfoRepo.save(createdShippingInfo);
  }

  async updateShippingInfo(shippingInfoId: number, body: UpdateShippingInfoDto) {
    const shippingInfo = await this.shippingInfoRepo.findOne({ where: { id: shippingInfoId } });

    if (!shippingInfo) {
      throw new NotFoundException('shipping info is not found by this id');
    }

    shippingInfo.status = body.status;
    await this.shippingInfoRepo.save(shippingInfo);
    return shippingInfo;
  }

  async save(order: Order) {
    return await this.orderRepo.save(order);
  }
}
