import { Module, forwardRef } from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { ReplyService } from './services/reply.service';
import { ReplyController } from './controllers/reply.controller';
import { Reply } from './entities/reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Reply]), ProductModule, UserModule],
  providers: [ReviewService, ReplyService],
  controllers: [ReviewController, ReplyController],
  exports: [ReviewService]
})
export class ReviewModule {}
