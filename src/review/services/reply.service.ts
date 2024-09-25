import { UpdateReplyDto } from './../dtos/update-reply-by-admin.dto';
import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Reply } from '../entities/reply.entity';
import { CreateReplyDto } from '../dtos/create-reply.dto';
import { Review } from '../entities/review.entity';
import { User } from 'src/user/User.entity';

@Injectable()
export class ReplyService {
  constructor(@InjectRepository(Reply) private replyRepo: Repository<Reply>) {}

  async createReply(body: CreateReplyDto, review: Review, user: User, parentReply: Reply) {
    const createdReply = this.replyRepo.create({ ...body, review, user, parentReply });
    const reply = await this.replyRepo.save(createdReply);
    return reply;
  }

  async findBy(where: FindOptionsWhere<Reply>, relations: string[] = []) {
    const reply = await this.replyRepo.findOne({ where, relations });

    if (!reply) {
      throw new NotFoundException('reply is not found by this id');
    }

    return reply;
  }

  async updateReply(replyId: number, body: UpdateReplyDto) {
    const reply = await this.findBy({ id: replyId });

    if (!reply) {
      throw new NotFoundException('reply is not found by this id');
    }

    Object.assign(reply, body);
    return await this.save(reply);
  }

  async save(reply: Reply) {
    return await this.replyRepo.save(reply);
  }

  async deleteReply(replyId: number) {
    const {affected} = await this.replyRepo.delete({ id: replyId });

    if(!affected) {
      throw new NotFoundException('reply is not found');
    }

    return affected;
  }

  async getAllRepliesBelongingToAReview (review: Review) {
    const replies = await this.replyRepo.find({
      where: {
        review: {
          id: review.id
        },
        parentReply: null
      },
      relations: ['replies', 'user']
    })

    return replies;
  }

  async getAllRepliesBelongingToAReply (reply: Reply) {
    const replies = await this.replyRepo.find({
      where: {
        parentReply: {
          id: reply.id
        }
      },
      relations: ['replies', 'user']
    })

    return replies;
  }
}
