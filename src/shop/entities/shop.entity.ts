import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ShopAddress } from '../interfaces/shop-address.interface';
import { Cooperator } from 'src/cooperator/entities/cooperator.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Cooperator, (cooperator) => cooperator.shop, { nullable: false })
  @JoinColumn({ name: 'cooperator_id' })
  cooperator: Cooperator;

  @Column({ type: 'json', nullable: false })
  address: ShopAddress;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc: string;

  @Column({ nullable: false })
  phone: string;

  @CreateDateColumn({
    type: Date,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
