import { User } from 'src/user/User.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { orderStatusEnum } from '../enums/orderStatus.enum';
import { OrderItem } from './orderItems.entity';
import { ShippingInfo } from './shippingInfo.entity';
import { Transaction } from 'src/transaction/transaction.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToOne(() => ShippingInfo, (shippingInfo) => shippingInfo.order, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'shipping_info_id' })
  shippingInfo: ShippingInfo;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @Column({ name: 'total_price', nullable: false })
  totalPrice: number;
  // sum of the total price of orderItems whitout considering discounts

  @Column({ name: 'final_price', nullable: false })
  finalPrice: number;
  // the price which user finally should pay,
  // order.finalPrice = order.orderItems.finalPrice

  @Column({ default: orderStatusEnum.PENDING, enum: orderStatusEnum })
  status: orderStatusEnum;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updatedAt: Date;
}
