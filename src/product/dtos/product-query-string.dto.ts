import { IsEnum, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductSortValidator } from '../validators/productSort.validator';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { productStatusEnum } from '../enums/productStatus.enum';
import { filterType } from 'src/common/types/filter.type';

export class ProductQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(ProductSortValidator)
  sort: string;

  @IsOptional()
  @Validate(OperatorValidator)
  sellPrice: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  price: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  likesQuantity: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  salesQuantity: string;

  @IsOptional()
  @Validate(OperatorValidator)
  viewsQuantity: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  stockQuantity: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  avgRating: filterType;

  @IsOptional()
  @IsEnum(productStatusEnum)
  status: productStatusEnum;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  q: string;
}
