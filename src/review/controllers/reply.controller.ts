import { UserService } from 'src/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { ProductService } from 'src/product/product.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ReplyService } from '../services/reply.service';
import { CreateReplyDto } from '../dtos/create-reply.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { Reply } from '../entities/reply.entity';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { UpdateReplyDto } from '../dtos/update-reply-by-admin.dto';

@Controller('/api/v1/')
export class ReplyController {
  constructor(
    private replyService: ReplyService,
    private reviewService: ReviewService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('reviews/:reviewId/replies')
  async addReplyToReview(
    @Body() body: CreateReplyDto,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewService.findById(reviewId);
    let parentReply: Reply = null;
    if (body.parentReply) {
      parentReply = await this.replyService.findBy({ id: body.parentReply });
    }
    const reply = await this.replyService.createReply(body, review, user, parentReply);

    return {
      status: 'success',
      message: 'reply is created successfully for this review',
      data: {
        reply,
      },
    };
  }

  @Patch('replies/:replyId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateReplyByAdmin(@Body() body: UpdateReplyDto, @Param('replyId') replyId: number) {
    const reply = await this.replyService.updateReply(replyId, body);

    return {
      status: 'success',
      message: 'reply is updated successfully',
      data: {
        reply,
      },
    };
  }

  @Delete('replies/:replyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async deleteReplyByAdmin(@Param('replyId') replyId: number) {
    const affected = await this.replyService.deleteReply(replyId);

    return {
      status: 'success',
      message: 'reply is deleted updated successfully',
      data: {
        affected,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('/replies/:replyId/replies')
  async getAllRepliesBelongingToAReply(
    @Param('replyId', ParseIntPipe) replyId: number,
    @CurrentUser() user: User,
  ) {
    const reply = await this.replyService.findBy({ id: replyId });
    const replies = await this.replyService.getAllRepliesBelongingToAReply(reply);

    return {
      status: 'success',
      message: 'all replies for this reply are received successfully',
      data: {
        replies,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('/reviews/:reviewId/replies')
  async getAllRepliesBelongingToAReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewService.findById(reviewId);
    const replies = await this.replyService.getAllRepliesBelongingToAReview(review);

    return {
      status: 'success',
      message: 'all replies for this review are received successfully',
      data: {
        replies,
      },
    };
  }
}
