import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/User.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { transactionTypeEnum } from './enums/transactionType.enum';
import { transactionStatusEnum } from './enums/transactionStatus.enum';
import { Payment } from 'src/payment/payment.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order, (order) => order.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => Payment, (payment) => payment.transaction)
  payment: Payment;

  @Column({ nullable: false })
  amount: number;

  @Column({ enum: transactionTypeEnum, nullable: false })
  type: transactionTypeEnum;

  @Column({ enum: transactionStatusEnum, nullable: false, default: transactionStatusEnum.PENDING })
  status: transactionStatusEnum;

  @Column({ nullable: true })
  traceNo: string;

  @Column({ nullable: true })
  Rrn: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;

  @Column({ name: 'finished_at', nullable: true })
  finishedAt: Date;
}
