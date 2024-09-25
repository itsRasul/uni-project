import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import {} from 'class-validator';
import { User } from 'src/user/User.entity';
// import { Post } from 'src/post/Post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';

@Entity()
@Index('user_product_unique_compound_index', ['product', 'user'], { unique: true })
export class Like {
  @ApiProperty({ example: 1, description: 'The unique identifier for the like.' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Product, description: 'The product that was liked.' })
  @ManyToOne(() => Product, (product) => product.likes, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ type: () => User, description: 'The user who made the like.' })
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    example: '2023-01-10T15:20:00Z',
    description: 'The timestamp when the like was created.',
  })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
