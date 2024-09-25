import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Min, Max } from 'class-validator';
import { User } from 'src/user/User.entity';
import reviewStatusEnum from '../enums/reviewStatus.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { Reply } from './reply.entity';

@Entity()
@Index('reviews_user_product_unique_compound_index', ['product', 'user'], { unique: true })
export class Review {
  @ApiProperty({ example: 1, description: 'The unique identifier for the review.' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'The user who wrote the review.' })
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: () => Product,
    description: 'The product that the review is associated with.',
  })
  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Reply, reply => reply.review)
  replies: Reply[]

  @ApiProperty({
    example: 4,
    description: 'The rating given in the review. Must be between 1 and 5.',
    minimum: 1,
    maximum: 5,
  })
  @Column({ nullable: false })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great product!',
    description: 'The comment provided in the review.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ApiProperty({
    example: 'ACCEPTED',
    description: 'The status of the review.',
    enum: reviewStatusEnum,
    default: reviewStatusEnum.PENDING,
  })
  @Column({ default: reviewStatusEnum.PENDING })
  status: reviewStatusEnum;

  @ApiProperty({
    example: '2023-01-15T10:00:00Z',
    description: 'The timestamp when the review was created.',
  })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-16T12:30:00Z',
    description: 'The timestamp when the review was last updated.',
  })
  @CreateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}
