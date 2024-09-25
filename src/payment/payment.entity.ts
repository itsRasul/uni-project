import { User } from 'src/user/User.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Transaction } from 'src/transaction/transaction.entity';
import { paymentGatewayEnum } from './enums/paymentGateway.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Transaction, (transaction) => transaction.payment, {onDelete: 'CASCADE'}) // i think it can be OneToOne, wait to see what would be happen
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column()
  resNumber: string;

  @Column({ nullable: true })
  refNumber: string;

  @Column({ nullable: false, enum: paymentGatewayEnum })
  gateway: paymentGatewayEnum;

  @Column({ name: 'payment_request', type: 'json', nullable: true })
  paymentRequest: Object;

  @Column({ name: 'payment_response', type: 'json', nullable: true})
  paymentResponse: Object;

  @Column({ name: 'payment_callback', type: 'json', nullable: true })
  paymentCallback: Object;

  @Column({ name: 'verify_request', type: 'json', nullable: true })
  verifyRequest: Object;

  @Column({ name: 'verify_response', type: 'json', nullable: true })
  verifyResponse: Object;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
