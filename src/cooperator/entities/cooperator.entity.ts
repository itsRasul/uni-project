import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CooperatorRoleEnum } from '../enums/cooperator-role.enum';
import { CooperatorAddress } from '../interfaces/cooperator-address.interface';
import { CooperatorCallStatusEnum } from '../enums/cooperator-call-status.enum';
import { CooperatorStatusEnum } from '../enums/cooperator-status.enum';
import { Shop } from 'src/shop/entities/shop.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity('cooperators')
export class Cooperator {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Category, (category) => category.cooperators)
  @JoinTable({ name: 'cooperator_categories' })
  categories: Category[];

  @OneToOne(() => Shop, (shop) => shop.cooperator)
  shop: Shop;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone_number', unique: true, nullable: false })
  phoneNumber: string;

  @Column({ type: Boolean, name: 'is_phone_number_verified', default: false })
  isPhoneNumberVerified: boolean;

  @Column({
    name: 'email',
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({ type: Boolean, name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ enum: CooperatorRoleEnum, nullable: false })
  role: CooperatorRoleEnum;

  @Column({
    name: 'call_status',
    enum: CooperatorCallStatusEnum,
    default: CooperatorCallStatusEnum.PENDING,
  })
  callStatus: CooperatorCallStatusEnum;

  @Column({
    enum: CooperatorStatusEnum,
    default: CooperatorStatusEnum.PENDING,
  })
  status: CooperatorStatusEnum;

  @Column({ type: 'json', nullable: false })
  address: CooperatorAddress;

  @Column({
    type: Date,
    name: 'cooperation_start_date',
    nullable: true,
  })
  cooperationStartDate: Date;

  @Column({
    type: Date,
    name: 'cooperation_end_date',
    nullable: true,
  })
  cooperationEndDate: Date;

  @CreateDateColumn({
    type: Date,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
