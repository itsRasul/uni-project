import { Discount } from './../../discount/entities/discount.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { productStatusEnum } from '../enums/productStatus.enum';
import { Category } from 'src/category/entities/category.entity';
import { ProductDetails } from './productDetails.entity';
import { Like } from 'src/like/entities/like.entity';
import { Review } from 'src/review/entities/review.entity';
import { CartItem } from 'src/cart/entities/cartItem.entity';
import { OrderItem } from 'src/order/entities/orderItems.entity';
import { ProductImage } from 'src/product-images/productImages.entity';
import { Tag } from 'src/tag/entities/tag.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Like, (like) => like.product)
  likes: Like[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, (cartItems) => cartItems.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItem: OrderItem;

  @ManyToOne(() => Discount, (discount) => discount.products)
  discount: Discount;

  @ManyToMany(() => Tag, (tag) => tag.products)
  tags: Tag[];

  @Column({
    length: 256,
    nullable: false,
  })
  title: string;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, { onDelete: 'CASCADE', eager: true })
  images: ProductImage[];

  @OneToOne(() => ProductImage, (productImage) => productImage.productCover, { nullable: true, eager: true })
  @JoinColumn({ name: 'cover' })
  cover: ProductImage;

  @Column({ nullable: true })
  desc: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: false })
  price: number;

  @Column({ name: 'sell_price', nullable: false })
  sellPrice: number;

  @Column({ length: 256, unique: true })
  slug: string;

  @OneToMany(() => ProductDetails, (productDetails) => productDetails.product, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  productDetails: ProductDetails[];

  @Column({ name: 'likes_quantity', default: 0 })
  likesQuantity: number;

  @Column({ name: 'sales_quantity', default: 0 })
  salesQuantity: number;

  @Column({ name: 'views_quantity', default: 0 })
  viewsQuantity: number;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({ type: 'float', name: 'avg_rating', default: 0 })
  avgRating: number;

  @ManyToMany(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  categories: Category[];

  @Column({ enum: productStatusEnum, default: productStatusEnum.ACTIVE })
  status: productStatusEnum;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  updatedAt: Date;
}
