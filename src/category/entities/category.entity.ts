import { Cooperator } from 'src/cooperator/entities/cooperator.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ default: 'category-default.png', nullable: false })
  photo: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: 0 })
  productCount: number;

  @ManyToOne(() => Category, (category) => category.childCategories, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  childCategories: Category[];

  @ManyToMany(() => Product, (product) => product.categories, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'product_categories' })
  products: Product[];

  @ManyToMany(() => Cooperator, (cooperator) => cooperator.categories)
  cooperators: Cooperator[];

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
