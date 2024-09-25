import { Module, forwardRef } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductController } from 'src/product/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './productImages.entity';
import { ProductImagesController } from './product-images.controller';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage]),UserModule, forwardRef(() => ProductModule)],
  providers: [ProductImagesService],
  controllers: [ProductImagesController],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
