import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { discountTypeEnum } from '../enums/discountType.enum';
import { Product } from 'src/product/entities/product.entity';
import { discountStatusEnum } from '../enums/discountStatus.enum';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: discountTypeEnum;

  @Column()
  value: number;

  // @Column({ default: false })
  // active: boolean;

  @Column({default: discountStatusEnum.PENDING})
  status: discountStatusEnum;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @OneToMany(() => Product, (product) => product.discount)
  products: Product[];

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
