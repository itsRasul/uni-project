import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItem, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: false, default: 1 })
  quantity: number;

  @Column({ nullable: false })
  price: number;
  // orderItem.price = product.price * orderItem.quantity

  @Column({ name: 'final_price', nullable: false })
  finalPrice: number;
  // orderItem.finalPrice = product.sellPrice * orderItem.quantity

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
