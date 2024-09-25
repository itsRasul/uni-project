import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import userRolesEnum from './enums/userRoles.enum';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'src/address/entities/address.entity';
import { Like } from 'src/like/entities/like.entity';
import { Review } from 'src/review/entities/review.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';
import { Reply } from 'src/review/entities/reply.entity';
import { Transaction } from 'src/transaction/transaction.entity';

@Entity()
export class User {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @ApiProperty({
    type: String,
    example: 'Ali',
  })
  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @ApiProperty({
    type: String,
    example: 'Mohamadi',
  })
  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @ApiProperty({})
  @Column({ name: 'phone_number', unique: true, nullable: true })
  phoneNumber: string;

  @ApiProperty({})
  @Column({ type: Boolean, name: 'is_phone_number_verified', default: false })
  isPhoneNumberVerified: boolean;

  @ApiProperty({})
  @Column({
    name: 'email',
    nullable: true,
    unique: true,
  })
  email: string;

  @ApiProperty({})
  @Column({ type: Boolean, name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'FRUCUU2COFLTSYLGJNTXILDNKJBU44JW',
  })
  @Column({ nullable: true, name: 'verification_code' })
  verificationSecretCode: string;

  @ApiProperty({
    type: String,
    nullable: false,
    example: 'Password1234',
  })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({
    type: String,
    nullable: false,
    enum: userRolesEnum,
    default: userRolesEnum.USER,
    example: userRolesEnum.USER,
  })
  @Column({ nullable: false, default: userRolesEnum.USER })
  role: userRolesEnum;

  @ApiProperty({
    type: Object,
    nullable: true,
    example: {
      token: '12345678',
      expires: new Date(),
    },
  })
  @Column({ type: 'jsonb', name: 'reset_password', nullable: true })
  resetPassword: {
    token: string;
    expires: Date;
  };

  @Column({
    type: 'text',
    name: 'refresh_token',
    unique: true,
    nullable: true,
    array: true,
  })
  refreshToken: string[];

  @ApiProperty({
    type: Object,
    nullable: false,
    example: Date.now(),
    default: 'CURRENT_TIMESTAMP',
  })
  @CreateDateColumn({
    type: Date,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    example: Date.now(),
  })
  @CreateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      const saltOrRounds = 12;
      this.password = await bcrypt.hash(this.password, saltOrRounds);
    }
  }
}
