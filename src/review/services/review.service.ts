import { Product } from '../../product/entities/product.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from 'src/user/User.entity';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { UpdateMyReviewDto } from '../dtos/update-my-review.dto';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import reviewStatusEnum from '../enums/reviewStatus.enum';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    private productService: ProductService,
  ) {}

  async createReview(body: CreateReviewDto, user: User, product: Product) {
    const review = this.reviewRepo.create({ ...body, user, product });

    return await this.reviewRepo.save(review);
  }

  async findAll(queryString: any, userRole: userRolesEnum) {
    let whereOption: { status: reviewStatusEnum } | {} = { status: reviewStatusEnum.ACCEPTED };
    if (userRole === userRolesEnum.ADMIN) {
      whereOption = {};
    }
    const query = this.reviewRepo.createQueryBuilder('review').where(whereOption);
    const feature = new QueryHelper<Review>(query, queryString, 'review')
      .sort()
      .paginate()
      .limit()
      .fields()
      .filter();

    const reviews = await feature
      .getQuery()
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .getMany();

    const count = await this.count(whereOption);

    return [reviews, count];
  }

  async findById(reviewId: number) {
    const review = await this.reviewRepo.findOne({
      where: {
        id: reviewId,
      },
      relations: ['product', 'user'],
    });

    if (!review) {
      throw new NotFoundException('review is not found by this id');
    }

    return review;
  }

  async deleteById(reviewId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('review is not found by this id');
    }

    const removedReview = await this.reviewRepo.remove(review);

    return removedReview;
  }

  async updateById(reviewId: number, body: any) {
    if (!Object.keys(body).length) {
      throw new BadRequestException('body must not to be empty');
    }

    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('review is not found by this id');
    }

    Object.assign(review, body);
    const updatedReview = await this.reviewRepo.save(review);

    return updatedReview;
  }

  async deleteMyReviewById(reviewId: number, user: User) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, user: { id: user.id } },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('review is not found by this id or it is not belonging to you');
    }

    const removedReview = await this.reviewRepo.remove(review);

    return removedReview;
  }

  async updateMyReview(reviewId: number, user: User, body: UpdateMyReviewDto) {
    if (!Object.keys(body).length) {
      throw new BadRequestException('body must not to be empty');
    }
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, user: { id: user.id } },
      relations: ['product'],
    });

    if (!review) {
      throw new NotFoundException('review is not found by this id or it is not belonging to you');
    }

    Object.assign(review, body);
    const updatedReview = await this.reviewRepo.save(review);

    return updatedReview;
  }

  async getAllReviewsBelongingToAProduct(productId: number, user?: User): Promise<[Review[], number]> {
    const product = await this.productService.findBy({ id: productId });

    if (user?.role === userRolesEnum.ADMIN) {
      const products = await this.reviewRepo.find({
        where: {
          product: {
            id: product.id,
          },
        },
        relations: ['product', 'user'],
      });
      const count = await this.count({
        product: {
          id: product.id,
        },
      });

      return [products, count];
    }
    const products = await this.reviewRepo.find({
      where: {
        product: {
          id: product.id,
        },
        status: reviewStatusEnum.ACCEPTED,
      },
      relations: ['product', 'user'],
    });

    const count = await this.count({
      product: {
        id: product.id,
      },
    });

    return [products, count]
  }

  async getAllReviewsBelongingToAUser(user: User, queryString: any) {
    const query = this.reviewRepo.createQueryBuilder('review').where({
      user: {
        id: user.id,
      },
    });

    const feature = new QueryHelper<Review>(query, queryString, 'review')
      .sort()
      .paginate()
      .limit()
      .fields();

    const reviews = await feature
      .getQuery()
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .getMany();
    return reviews;
  }

  async count(where: FindOptionsWhere<Review> = {}) {
    return await this.reviewRepo.count({ where });
  }

  async calculateAvgRating(product: Product) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.product = :productId', { productId: product.id })
      .select('AVG(rating)', 'avgRating')
      .getRawOne();

    const avgRatingRounded = Number(Number(result.avgRating).toFixed(1));

    return avgRatingRounded;
  }
}
