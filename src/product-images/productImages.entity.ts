import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';

@Entity('product_images')
export class ProductImage {
  @ApiProperty({ example: 1, description: 'The unique identifier for the reply.' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToOne(() => Product, (product) => product.cover)
  productCover: Product;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  createdAt: Date;
}
