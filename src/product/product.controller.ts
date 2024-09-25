import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { CategoryService } from 'src/category/category.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Category } from 'src/category/entities/category.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import {
  customeDestinationForProductPhotos,
  customeFileNameForProductsPhotos,
} from 'src/common/utilities/MulterOptions';
import { MaxSizeValidatorProductPhotos } from './pipes/MaxSizeValidatorProductPhotos.pipe';
import { TypeValidatorProductPhotos } from './pipes/TypeValidatorProductsPhotos.pipe';
import { ProductImagesService } from 'src/product-images/product-images.service';
import { ProductImage } from 'src/product-images/productImages.entity';
import { TagService } from 'src/tag/tag.service';
import { ProductQueryStringDto } from './dtos/product-query-string.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';

@Controller('/api/v1')
export class ProductController {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private productImagesService: ProductImagesService,
    private tagService: TagService,
  ) {}

  @Get('/products/discounted')
  async getAllDiscountedProducts(@Query() queryString: ProductQueryStringDto) {
    const discountedProducts = await this.productService.getAllDiscountedProducts(queryString);
    const productCount = await this.productService.count();

    return {
      status: 'success',
      message: 'all discounted products are received successfully',
      data: {
        count: productCount,
        discountedProducts,
      },
    };
  }


  @Post('/products')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      storage: multer.diskStorage({
        destination: customeDestinationForProductPhotos,
        filename: customeFileNameForProductsPhotos,
      }),
    }),
  )
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxSizeValidatorProductPhotos({ maxSize: 2 }),
          new TypeValidatorProductPhotos({ fileType: new RegExp('^(image).*') }),
        ],
        fileIsRequired: true,
      }),
    )
    images: Express.Multer.File[],
  ) {
    if (images.length) {
      const promises: Promise<ProductImage>[] = [];
      for (let i = 0; i < images.length; i++) {
        promises.push(
          this.productImagesService.createProductImage(images[i].filename, images[i].size),
        );
      }

      var productImages = await Promise.all(promises);
      var cover: ProductImage = productImages[0];
    }
    const categories = await this.categoryService.findAllByIds(body.categories);

    if (body.tags) {
      var tags = await this.tagService.findOrCreate(body.tags);
    }

    const product = await this.productService.createProduct({
      ...body,
      categories,
      images: productImages,
      cover,
      tags,
    });
    if (body.productDetails) {
      await this.productService.addProductDetails(product, body.productDetails);
    }

    return {
      status: 'success',
      message: 'product is created successfully',
      data: {
        product,
      },
    };
  }

  @Get('/products/:productId')
  async getOneProduct(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productService.findBy({ id: productId });

    const updatedProduct = await this.productService.increaseViewsQuantity(product);

    return {
      status: 'success',
      message: 'product is created successfully',
      data: {
        product: updatedProduct,
      },
    };
  }

  @Get('/products')
  async getAllProducts(@Query() queryString: ProductQueryStringDto) {
    const products = await this.productService.findAll(queryString);
    const productCount = await this.productService.count();
    const [min, max] = await this.productService.getMinAndMaxPrice()

    return {
      status: 'success',
      message: 'products are received successfully',
      data: {
        count: productCount,
        priceData: {
          min, max
        },
        products,
      },
    };
  }

  @Delete('/products/:productId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('productId', ParseIntPipe) productId: number) {
    const removedProducts = await this.productService.deleteBy({ id: productId });

    return {
      status: 'success',
      message: 'products is deleted successfully',
      data: {
        removedProducts,
      },
    };
  }

  @Patch('/products/:productId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateProductDto,
  ) {
    let categories: Category[];
    if (body.categories) {
      categories = await this.categoryService.findAllByIds(body.categories);
    }

    if (body.tags) {
      var tags = await this.tagService.findOrCreate(body.tags);
    }

    const updatedProduct = await this.productService.updateBy(
      { id: productId },
      { ...body, categories, tags },
    );

    if (body.productDetails) {
      await this.productService.addProductDetails(updatedProduct, body.productDetails);
    }

    return {
      status: 'success',
      message: 'products is updated successfully',
      data: {
        updatedProduct,
      },
    };
  }

  @Get('/categories/:categoryId/products')
  async getAllProductsBelongingToACategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query() queryString: any,
  ) {
    const category = await this.categoryService.getOneCategory(categoryId);
    const products = await this.productService.getAllProductsBelongingToACategory(
      category,
      queryString,
    );
    const productCount = await this.productService.count();
    const [min, max] = await this.productService.getMinAndMaxPrice()


    return {
      status: 'success',
      message: 'all products belonging to this category are received',
      data: {
        count: productCount,
        priceData: {
          min, max
        },
        products,
      },
    };
  }

  @Get('/products/:productId/related')
  async getRelatedProducts(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() queryString: any,
  ) {
    const product = await this.productService.findBy({ id: productId });
    const relatedProducts = await this.productService.getRelatedProducts(product, queryString);

    return {
      status: 'success',
      message: 'all related products are received successfully',
      data: {
        relatedProducts,
      },
    };
  }

  @Patch('products/:productId/productImages/:productImageId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async setCover(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('productImageId', ParseIntPipe) productImageId: number,
  ) {
    const product = await this.productService.findBy({ id: productId });
    const cover = await this.productImagesService.findBy({
      id: productImageId,
      product: {
        id: product.id,
      },
    });

    product.cover = cover;
    await this.productService.save(product);

    return {
      status: 'success',
      message: 'product cover is set successfully',
      data: {
        product,
        cover,
      },
    };
  }
}
