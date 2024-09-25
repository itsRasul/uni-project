import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/User.entity';
import { CartItem } from './cartItem.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems: CartItem[];

  @OneToOne(() => User, (user) => user.cart, { nullable: false, onDelete: 'CASCADE' }) // OneToOne relationship doesn't work
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'total_price', type: 'float', default: 0 })
  totalPrice: number; // equals to order.price

  @Column({name: 'discounted_price', nullable: false, default: 0})
  discountedPrice: number; // the price which is discounted

  @Column({ type: 'float', name: 'delivery_cost', default: 0 })
  deliveryCost: number; // a constant

  @Column({ type: 'float', name: 'final_price', default: 0 })
  finalPrice: number; // cart.price - cart.discountedPrice + cart.deliveryCost

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
