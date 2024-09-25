import { UserService } from 'src/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { UpdateReviewByAdminDto } from '../dtos/update-review-by-admin.dto';
import { UpdateMyReviewDto } from '../dtos/update-my-review.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Review } from '../entities/review.entity';
import { IsLoggedIn } from 'src/auth/guard/isLoggedIn.guard';
import { ProductService } from 'src/product/product.service';
import { ReviewQueryStringDto } from '../dtos/review-query-string.dto';

@ApiTags('Reviwes')
@Controller('/api/v1/')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);
  constructor(
    private reviewService: ReviewService,
    private productService: ProductService,
    private usersService: UserService,
  ) {}

  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'product not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Post('/products/:productId/reviews')
  async createReview(
    @Body() body: CreateReviewDto,
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const product = await this.productService.findBy({ id: productId });
    const review = await this.reviewService.createReview(body, user, product);

    // calculate avgRating
    const avgRating = await this.reviewService.calculateAvgRating(product);
    await this.productService.setAvgRating(product, avgRating);

    return {
      status: 'success',
      message: 'review is created successfully',
      data: {
        review,
      },
    };
  }

  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({
    name: 'sort',
    description: 'Sort order',
    example: '-createdAt',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
  })
  @ApiQuery({
    name: 'fields',
    description: 'fields of entity to projection',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews retrieved successfully',
    type: Review,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiCookieAuth('token')
  @Get('/reviews')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllReviews(@Query() queryString: ReviewQueryStringDto, @CurrentUser() user: User) {
    const [reviews, count] = await this.reviewService.findAll(queryString, user.role);

    return {
      status: 'success',
      message: 'reviews are received successfully',
      data: {
        reviews,
        count,
      },
    };
  }

  @ApiOperation({ summary: 'Get one review by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review retrieved successfully',
    type: Review,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiParam({
    name: 'reviewId',
    type: Number,
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Get('/reviews/:reviewId')
  async getOneReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
    const review = await this.reviewService.findById(reviewId);

    return {
      status: 'success',
      message: 'review is found successfully',
      data: {
        review,
      },
    };
  }

  @ApiOperation({ summary: 'Get all reviews belonging to a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews belonging to the product retrieved successfully',
    type: [Review],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'product not found',
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sort order',
    example: '-createdAt',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
  })
  @ApiQuery({
    name: 'fields',
    description: 'fields of entity to projection',
    required: false,
  })
  @UseGuards(IsLoggedIn)
  @Get('/products/:productId/reviews')
  async getAllReviewsBelongingToAProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() queryString: ReviewQueryStringDto,
    @CurrentUser() user: User,
  ) {
    const [reviews, count] = await this.reviewService.getAllReviewsBelongingToAProduct(productId, user);

    return {
      status: 'success',
      message: 'reviews belonging to this product are found successfully',
      data: {
        reviews,
        count
      },
    };
  }

  @ApiOperation({ summary: 'Get all reviews belonging to a user' })
  @ApiParam({
    name: 'userId',
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sort order',
    example: '-createdAt',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
  })
  @ApiQuery({
    name: 'fields',
    description: 'fields of entity to projection',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews belonging to the user retrieved successfully',
    type: [Review],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiCookieAuth('token')
  @Get('/users/:userId/reviews')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllReviewsBelongingToAUser(
    @Param('userId') userId: number,
    @Query() queryString: ReviewQueryStringDto,
  ) {
    const user = await this.usersService.findById(userId);
    const reviews = await this.reviewService.getAllReviewsBelongingToAUser(user, queryString);
    const count = await this.reviewService.count({
      user: {
        id: user.id,
      },
    });

    return {
      status: 'success',
      message: 'reviews belonging to this product are found successfully',
      data: {
        reviews,
        count,
      },
    };
  }

  @ApiOperation({ summary: 'Get my all reviews' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews for the current user retrieved successfully',
    type: [Review],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Get('/me/reviews')
  // FIX THE LOGIC, NOW DOSN'T WORK
  async getAllMyReviews(
    @CurrentUser() currentUser: User,
    @Query() queryString: ReviewQueryStringDto,
  ) {
    const reviews = await this.reviewService.getAllReviewsBelongingToAUser(
      currentUser,
      queryString,
    );

    const reviewsCount = await this.reviewService.count({
      user: {
        id: currentUser.id,
      },
    });

    return {
      status: 'success',
      message: 'your all reviews are received successfully',
      data: {
        count: reviewsCount,
        reviews,
      },
    };
  }

  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Review deleted successfully',
    type: null,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiCookieAuth('token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Delete('/reviews/:reviewId')
  async deleteReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
    const removedReview = await this.reviewService.deleteById(reviewId);

    const avgRating = await this.reviewService.calculateAvgRating(removedReview.product);
    await this.productService.setAvgRating(removedReview.product, avgRating);

    return {
      status: 'success',
      message: 'review is delete successfully',
      data: {
        removedReview,
      },
    };
  }

  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review updated successfully',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request: Body must not be empty',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiCookieAuth('token')
  @Patch('/reviews/:reviewId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateReviewById(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: UpdateReviewByAdminDto,
  ) {
    const updatedReview = await this.reviewService.updateById(reviewId, body);

    return {
      status: 'success',
      message: 'review is updated successfully',
      data: {
        updatedReview,
      },
    };
  }

  @ApiOperation({ summary: 'Delete my review by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Review deleted successfully',
    type: null,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found or not belonging to the current user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/me/reviews/:reviewId')
  async deleteMyReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: User,
  ) {
    const removedReview = await this.reviewService.deleteMyReviewById(reviewId, user);

    const avgRating = await this.reviewService.calculateAvgRating(removedReview.product);
    await this.productService.setAvgRating(removedReview.product, avgRating);

    return {
      status: 'success',
      message: 'your review is delete successfully',
      data: {
        removedReview,
      },
    };
  }

  @ApiOperation({ summary: 'Update a review owned by the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review updated successfully',
    type: Review,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request: Body must not be empty',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found or not belonging to the current user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Patch('/me/reviews/:reviewId')
  async updateMyReview(
    @CurrentUser() user: User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: UpdateMyReviewDto,
  ) {
    const updatedReview = await this.reviewService.updateMyReview(reviewId, user, body);

    const avgRating = await this.reviewService.calculateAvgRating(updatedReview.product);
    await this.productService.setAvgRating(updatedReview.product, avgRating);

    return {
      status: 'success',
      message: 'your review is updated successfully',
      data: {
        updatedReview,
      },
    };
  }
}
