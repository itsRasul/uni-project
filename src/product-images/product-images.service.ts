import { Repository, FindOptionsWhere } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImage } from './productImages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class ProductImagesService {
  constructor(@InjectRepository(ProductImage) private productImageRepo: Repository<ProductImage>) {}

  async createProductImage(name: string, size: number) {
    const createdProductImage = this.productImageRepo.create({ name, size });

    const productImage = await this.productImageRepo.save(createdProductImage);

    return productImage;
  }

  async getAllProductImagesBelongingToAProduct(product: Product) {
    const images = await this.productImageRepo.find({
      where: {
        product: {
          id: product.id,
        },
      },
    });

    return images;
  }

  async deleteProductImage(productImageId: number, product: Product) {
    const productImage = await this.productImageRepo.findOne({
      where: {
        id: productImageId,
        product: {
          id: product.id,
        },
      },
    });

    if (!productImage) {
      throw new NotFoundException(
        'product image is not found by this id, or it is not belonging to this product',
      );
    }

    await this.productImageRepo.remove(productImage);
    return productImage;
  }

  async findBy(where: FindOptionsWhere<ProductImage>) {
    const productImage = await this.productImageRepo.findOne({ where });

    if (!productImage) {
      throw new NotFoundException('productImage is not found');
    }

    return productImage;
  }
}
