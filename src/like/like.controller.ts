import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Delete,
  Get,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { ProductService } from '../product/product.service';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { UserService } from 'src/user/user.service';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Like } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { LikeQueryStringDto } from './dtos/like-query-string.dto';

@ApiTags('Likes')
@Controller('/api/v1')
export class LikeController {
  constructor(
    private likeService: LikeService,
    private productService: ProductService,
    private usersService: UserService,
  ) {}

  @ApiOperation({ summary: 'Get all likes' })
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
    description: 'fields of impression for projection',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'all likes are received successfully',
    type: [Like],
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
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Get('/likes')
  async getAllLikes(@Query() queryString: LikeQueryStringDto) {
    const likes = await this.likeService.findAll(queryString);
    const likesCount = await this.likeService.count();

    return {
      status: 'success',
      message: 'all likes are received successfully',
      data: {
        count: likesCount,
        likes,
      },
    };
  }

  @ApiOperation({ summary: 'Create a like for a product' })
  @ApiParam({
    name: 'productId',
    description: 'ID of the product to be liked',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like created successfully',
    type: Like,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'product not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Post('/products/:productId/likes')
  async createLike(@Param('productId', ParseIntPipe) productId: number, @CurrentUser() user: User) {
    const product = await this.productService.findBy({ id: productId });
    const like = await this.likeService.createLike(product, user);

    return {
      status: 'success',
      message: 'you liked the product successfully',
      data: {
        like,
      },
    };
  }

  @ApiOperation({ summary: 'un like a product' })
  @ApiParam({
    name: 'productId',
    description: 'ID of the product to be liked',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Like created successfully',
    type: Like,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'product not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiParam({
    name: 'likeId',
    type: Number,
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/likes/:likeId')
  async unLike(@Param('likeId', ParseIntPipe) likeId: number, @CurrentUser() user: User) {
    const removedLike = await this.likeService.unLike(user, likeId);

    return {
      status: 'success',
      message: 'you unliked the product successfully',
      data: {
        removedLike,
      },
    };
  }

  @ApiOperation({ summary: 'Get all products liked by a user' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to retrieve liked products for',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All products liked by the user received successfully',
    type: [Product],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Get('/users/:userId/likes')
  async getAllProductsAUserLikes(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.usersService.findById(userId);
    const products = await this.likeService.getAllProductsAUserLikes(user);
    const likesCount = await this.likeService.count({
      user: {
        id: user.id,
      },
    });

    return {
      status: 'success',
      message: 'all products user is liked are received sucessfully',
      data: {
        count: likesCount,
        products,
      },
    };
  }

  @ApiOperation({ summary: 'Get all products i liked' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All products liked by the user received successfully',
    type: [Product],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Get('/me/likes/products')
  async getAllProductsILiked(@CurrentUser() user: User) {
    const products = await this.likeService.getAllProductsAUserLikes(user);
    const likesCount = await this.likeService.count({
      user: {
        id: user.id,
      },
    });
    
    return {
      status: 'success',
      message: 'all products you liked are received sucessfully',
      data: {
        count: likesCount,
        products,
      },
    };
  }
}
