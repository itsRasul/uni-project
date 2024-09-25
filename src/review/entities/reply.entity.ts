import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/User.entity';
import { Review } from './review.entity';
import replyStatusEnum from '../enums/replyStatus.enum';

@Entity('replies')
export class Reply {
  @ApiProperty({ example: 1, description: 'The unique identifier for the reply.' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'The user who wrote the reply.' })
  @ManyToOne(() => User, (user) => user.replies, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: () => Review,
    description: 'The review that the reply is associated with.',
  })
  @ManyToOne(() => Review, (review) => review.replies, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @ApiProperty({
    example: 'Thank you for your feedback!',
    description: 'The reply provided to the review.',
    required: true,
  })
  @Column({ type: 'text', nullable: false })
  comment: string;

  
  @ApiProperty({
    example: replyStatusEnum.ACCEPTED,
    description: 'The status of reply',
    required: true,
    default: replyStatusEnum.PENDING
  })
  @Column({ default: replyStatusEnum.PENDING, nullable: false })
  status: replyStatusEnum

  @ApiProperty({
    example: '2023-01-17T09:45:00Z',
    description: 'The timestamp when the reply was created.',
  })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    type: () => [Reply],
    description: 'Replies to this reply.',
    required: false,
  })
  @OneToMany(() => Reply, (reply) => reply.parentReply, { nullable: true })
  replies: Reply[];

  @ManyToOne(() => Reply, (reply) => reply.replies, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_reply_id', referencedColumnName: 'id' })
  parentReply: Reply;
}
