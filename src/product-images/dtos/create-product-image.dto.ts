import { IsNotEmpty, IsOptional } from 'class-validator';
import { ProductImage } from '../productImages.entity';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsOptional()
  image: ProductImage;
}
