import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CategorySortType } from '../enums/categorySortType.enum';
import { IsOptional, Matches, Validate } from 'class-validator';
import { CategorySortValidator } from '../validators/categorySort.validator';
import { filterType } from 'src/common/types/filter.type';
import { OperatorValidator } from 'src/common/validators/operator.validator';

export class CategoryQueryString extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(CategorySortValidator)
  sort: CategorySortType;

  @IsOptional()
  @Validate(OperatorValidator)
  productCount: filterType;
}
