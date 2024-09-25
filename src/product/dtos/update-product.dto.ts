import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { productStatusEnum } from '../enums/productStatus.enum';
import { Type } from 'class-transformer';
import { ProductDetails } from '../entities/productDetails.entity';

class ProductDetailsDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(3, 256)
  title: string;

  @IsString()
  @IsOptional()
  desc: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  slug: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDetailsDto)
  productDetails: ProductDetails[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categories: number[];

  @IsOptional()
  @IsEnum(productStatusEnum)
  status: productStatusEnum;

  @IsNotEmpty()
  @IsOptional()
  @Type(() => Number)
  stockQuantity: number;

  @IsString()
  @IsOptional()
  brand: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
}
