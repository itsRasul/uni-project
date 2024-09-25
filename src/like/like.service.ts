import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/user/User.entity';
import { Product } from '../product/entities/product.entity';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { ProductService } from 'src/product/product.service';
import { LikeQueryStringDto } from './dtos/like-query-string.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    private productService: ProductService,
  ) {}

  async createLike(product: Product, user: User) {
    const createdLike = this.likeRepo.create({ product, user });

    const like = await this.likeRepo.save(createdLike);

    await this.productService.increaseLikeQuantity(product);

    return like;
  }

  async unLike(user: User, likeId: number) {
    const like = await this.likeRepo.findOne({
      where: {
        id: likeId,
        user: {
          id: user.id,
        },
      },
      relations: ['product'],
    });

    if (!like) {
      throw new NotFoundException('like is not found by this id or it is not belonging to you');
    }

    const removedLike = await this.likeRepo.remove(like);

    await this.productService.decreaseLikeQuantity(like.product);

    return removedLike;
  }

  async getAllLikesBelongingToAUser(user: User) {
    return await this.likeRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['product'],
    });
  }

  async getAllProductsAUserLikes(user: User) {
    const likes = await this.getAllLikesBelongingToAUser(user);
    return likes.map((like: Like) => like.product);
  }

  async findAll(queryString: LikeQueryStringDto) {
    const query = this.likeRepo.createQueryBuilder('like');
    const feature = new QueryHelper<Like>(query, queryString, 'like')
      .sort()
      .paginate()
      .limit()
      .fields();

    const likes = await feature
      .getQuery()
      .leftJoinAndSelect('like.product', 'product')
      .leftJoinAndSelect('like.user', 'user')
      .getMany();

    return likes;
  }

  async count(where: FindOptionsWhere<Like> = {}) {
    return await this.likeRepo.count({ where });
  }
}
