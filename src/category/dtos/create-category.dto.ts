import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  parentCategory: Category;

  @IsOptional()
  @IsString()
  photo: string;

  @IsOptional()
  @IsNumber()
  priority: number;
}
