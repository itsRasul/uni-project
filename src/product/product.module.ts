import { ProductImagesModule } from './../product-images/product-images.module';
import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDetails } from './entities/productDetails.entity';
import { UserModule } from 'src/user/user.module';
import { CategoryModule } from 'src/category/category.module';
import { ReviewModule } from 'src/review/review.module';
import { TagModule } from 'src/tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetails]),
    UserModule,
    forwardRef(() => ProductImagesModule),
    forwardRef(() => CategoryModule),
    TagModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
