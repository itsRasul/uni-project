import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { CreateDiscountDto } from './dtos/create-discount.dto';
import { ProductService } from 'src/product/product.service';
import { ApplyDiscountToMultipleProductDto } from './dtos/apply-discount-to-multiple-product.dto';
import { DiscountQueryStringDto } from './dtos/discount-query-string.dto';

@Controller('/api/v1')
export class DiscountController {
  constructor(
    private discountService: DiscountService,
    private productService: ProductService,
  ) {}

  @Post('/discounts')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @HttpCode(HttpStatus.CREATED)
  async createDiscount(@Body() body: CreateDiscountDto) {
    const discount = await this.discountService.createDiscount(body);

    return {
      stastu: 'success',
      message: 'discount is created successfully',
      data: {
        discount,
      },
    };
  }

  @Get('/discounts')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllDiscounts(@Query() queryString: DiscountQueryStringDto) {
    console.log({ queryString });
    const discounts = await this.discountService.findAll(queryString);

    const discountsCount = await this.discountService.count();

    return {
      stastu: 'success',
      message: 'all discounts are received successfully',
      data: {
        count: discountsCount,
        discounts,
      },
    };
  }

  @Post('/products/multiple/discounts/:discountId/apply-discount')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async applyDiscountToMultipleProduct(
    @Body() body: ApplyDiscountToMultipleProductDto,
    @Param('discountId', ParseIntPipe) discountId: number,
  ) {
    const discount = await this.discountService.findBy({ id: discountId });
    const products = await this.productService.findAllByIds(body.products);

    const result = await this.discountService.applyDiscountToMultipleProducts(discount, products);

    return {
      stastu: 'success',
      message: 'discount is applied to multiple products successfully',
      data: {
        result,
      },
    };
  }

  @Get('/products/:productId/discounts/:discountId/apply-discount')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async applyDiscountToProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('discountId', ParseIntPipe) discountId: number,
  ) {
    const discount = await this.discountService.findBy({ id: discountId });
    const product = await this.productService.findBy({ id: productId });

    const result = await this.discountService.applyDiscountToProduct(discount, product);

    return {
      stastu: 'success',
      message: 'discount is applied to the product successfully',
      data: {
        result,
      },
    };
  }

  @Get('/products/:productId/un-apply-discount')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async unApplyDiscountToProduct(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.findBy({ id: productId });

    const result = await this.discountService.unApplyDiscountForProduct(product);

    return {
      stastu: 'success',
      message: 'discount is un applied for the product successfully',
      data: {
        result,
      },
    };
  }

  @Get('/discounts/:discountId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getOneDiscount(@Param('discountId', ParseIntPipe) discountId: number) {
    const discount = await this.discountService.findBy({ id: discountId });

    return {
      stastu: 'success',
      message: 'discount is received successfully',
      data: {
        discount,
      },
    };
  }
}
