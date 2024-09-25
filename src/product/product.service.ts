import { query } from 'express';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDetails } from './entities/productDetails.entity';
import { Category } from 'src/category/entities/category.entity';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { CategoryService } from 'src/category/category.service';
import { productStatusEnum } from './enums/productStatus.enum';
import { ProductQueryStringDto } from './dtos/product-query-string.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductDetails) private productDetailsRepo: Repository<ProductDetails>,
    private categoryService: CategoryService,
  ) {}

  async getAllDiscountedProducts (queryString: ProductQueryStringDto) {
    const query = this.productRepo.createQueryBuilder('product').where('product.price != product.sell_price');
    const feature = new QueryHelper<Product>(query, queryString, 'product')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter()
      .search('title');

    const products = await feature
      .getQuery()
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.discount', 'discount')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.cover', 'cover')
      .getMany();

    return products;
  }

  async createProduct(body: Partial<Product>) {
    const createdProduct = this.productRepo.create({ ...body, sellPrice: body.price });

    await this.categoryService.increaseProductCountField(body.categories);

    const product = await this.productRepo.save(createdProduct);

    return product;
  }

  async addProductDetails(product: Product, productDetails: Partial<ProductDetails>[]) {
    const promises = productDetails.map((productDetail, i) => {
      return this.productDetailsRepo.save({ ...productDetail, product: product });
    });

    return await Promise.all(promises);
  }

  async findBy(dto: FindOptionsWhere<Product>) {
    const product = await this.productRepo.findOne({
      where: dto,
      relations: ['categories', 'productDetails', 'discount', 'images', 'tags', 'cover'],
    });

    if (!product) {
      throw new NotFoundException('product is not found by this id');
    }

    return product;
  }

  async findAll(queryString: any) {
    const query = this.productRepo.createQueryBuilder('product');
    const feature = new QueryHelper<Product>(query, queryString, 'product')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter()
      .search('title');

    const products = await feature
      .getQuery()
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.discount', 'discount')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.cover', 'cover')
      .getMany();

    return products;
  }

  async deleteBy(dto: FindOptionsWhere<Product>) {
    const product = await this.productRepo.findOne({ where: dto, relations: ['categories'] });

    const deletedProduct = await this.productRepo.remove(product);

    if (!deletedProduct) {
      throw new NotFoundException('product is not found by this id');
    }

    await this.categoryService.decreaseProductCountField(product.categories);

    return deletedProduct;
  }

  async updateBy(dto: FindOptionsWhere<Product>, body: Partial<Product>) {
    const product = await this.productRepo.findOne({ where: dto, relations: ['categories'] });

    if (!product) {
      throw new NotFoundException('product is not found by this id');
    }

    const oldCategories = product.categories;

    Object.assign(product, body);
    await this.productRepo.save(product);

    if (body.categories.length) {
      // if a product categories has changed, decrease the product count the old categories
      // and increase productCount fdield for new categories
      await this.categoryService.decreaseProductCountField(oldCategories);
      // i have to fetch categories again to calculate productCount correctly
      const newCatregoreies = await this.categoryService.findAllByIds(
        body.categories.map((category) => category.id),
      );
      await this.categoryService.increaseProductCountField(newCatregoreies);
    }

    return product;
  }

  async save(product: Product) {
    return await this.productRepo.save(product);
  }

  async count(where: FindOptionsWhere<Product> = {}) {
    return await this.productRepo.count({ where: where });
  }

  async findAllByIds(ids: number[] = []) {
    const products = await this.productRepo
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids })
      .getMany();

    return products;
  }

  async getAllProductsBelongingToACategory(category: Category, queryString: any) {
    console.log({ queryString });
    const query = this.productRepo.createQueryBuilder('product');
    const feature = new QueryHelper<Product>(query, queryString, 'product')
      .sort()
      .paginate()
      .limit()
      .fields()
      .filter()
      .search('title');

    const products = await feature
      .getQuery()
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.discount', 'discount')
      .leftJoinAndSelect('product.images', 'productImages')
      .leftJoinAndSelect('product.tags', 'tags')
      .andWhere('category.id = :categoryId', { categoryId: category.id })
      .getMany();

    return products;
  }

  async increaseLikeQuantity(product: Product) {
    product.likesQuantity += 1;
    return await this.save(product);
  }

  async decreaseLikeQuantity(product: Product) {
    product.likesQuantity -= 1;
    return await this.save(product);
  }

  async increaseViewsQuantity(product: Product) {
    product.viewsQuantity += 1;
    return await this.save(product);
  }

  async setAvgRating(product: Product, avgRating: number) {
    product.avgRating = avgRating;
    return await this.save(product);
  }

  async getRelatedProducts(product: Product, querystring: any) {
    const relatedProucts = await this.productRepo.find({
      where: {
        tags: {
          id: In(product.tags.map((tag) => tag.id)),
        },
      },
      relations: ['tags'],
      take: querystring.limit ?? 12,
    });

    return relatedProucts;
  }

  async getMinAndMaxPrice () {
    const result = await this.productRepo
    .createQueryBuilder('product')
    .select('MIN(product.price)', 'minPrice')
    .addSelect('MAX(product.price)', 'maxPrice')
    .getRawMany();

    return [result[0].minPrice, result[0].maxPrice];
  }
}
