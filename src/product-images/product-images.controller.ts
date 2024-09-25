import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import {
  customeDestinationForProductPhotos,
  customeFileNameForProductsPhotos,
} from 'src/common/utilities/MulterOptions';
import { MaxSizeValidatorProductPhotos } from 'src/product/pipes/MaxSizeValidatorProductPhotos.pipe';
import { TypeValidatorProductPhotos } from 'src/product/pipes/TypeValidatorProductsPhotos.pipe';
import { ProductService } from 'src/product/product.service';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';

@Controller('/api/v1')
export class ProductImagesController {
  constructor(
    private productImagesService: ProductImagesService,
    private productService: ProductService,
  ) {}

  @Post('/products/:productId/product-images')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.diskStorage({
        destination: customeDestinationForProductPhotos,
        filename: customeFileNameForProductsPhotos,
      }),
    }),
  )
  async createProductImage(
    @Body() body: CreateProductImageDto,
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxSizeValidatorProductPhotos({ maxSize: 2 }),
          new TypeValidatorProductPhotos({ fileType: new RegExp('^(image).*') }),
        ],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
  ) {
    const product = await this.productService.findBy({ id: productId });

    // check if the length of productImages of product is less than 6 (the maximum images whcih each product can have)
    if (product.images.length > 6) {
      throw new BadRequestException('every product can have 6 images maximum');
    }

    const productImage = await this.productImagesService.createProductImage(
      image.filename,
      image.size,
    );
    product.images.push(productImage);
    await this.productService.save(product);

    return {
      status: 'success',
      message: 'product image is created successfully',
      data: {
        productImage,
      },
    };
  }

  @Delete('/products/:productId/product-images/:productImageId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProductImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('productImageId', ParseIntPipe) productImageId: number,
  ) {
    const product = await this.productService.findBy({ id: productId });
    const productImage = await this.productImagesService.deleteProductImage(
      productImageId,
      product,
    );

    return {
      status: 'success',
      message: 'product image is deleted successfully',
      data: {
        productImage,
      },
    };
  }
}
