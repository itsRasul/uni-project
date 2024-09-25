import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ name: 'product_count', default: 0 })
  productCount: number;

  @ManyToMany(() => Product, (product) => product.tags)
  @JoinTable({ name: 'product_tags' })
  products: Product[];

  @CreateDateColumn({
    type: Date,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
