import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsArray,
  IsPositive,
} from 'class-validator';
import { productStatusEnum } from '../enums/productStatus.enum';
import { Type } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { ProductDetails } from '../entities/productDetails.entity';
import { ProductImage } from 'src/product-images/productImages.entity';

class ProductDetailsDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  title: string;

  @IsArray()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  images: ProductImage[];

  @IsString()
  @IsOptional()
  desc: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  // @IsNumber() // uncomment this in production , in postman i can not set number field
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  productDetails: ProductDetails[];

  @IsArray()
  // @IsNumber({}, { each: true }) // uncomment this in production , in postman i can not set number field
  categories: number[];

  @IsOptional()
  @IsEnum(productStatusEnum)
  status: productStatusEnum;

  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  stockQuantity: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
}
