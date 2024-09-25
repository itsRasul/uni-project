import { IsEnum, IsOptional, Matches, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { ReviewSortValidator } from '../validators/ReviewSort.validator';
import reviewStatusEnum from '../enums/reviewStatus.enum';

export class ReviewQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(ReviewSortValidator)
  sort: string;

  @IsOptional()
  @Validate(OperatorValidator)
  rating: filterType;

  @IsOptional()
  @IsEnum(reviewStatusEnum)
  status: reviewStatusEnum;
}
