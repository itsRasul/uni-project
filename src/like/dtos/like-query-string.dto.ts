import { IsOptional, Matches, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { LikeSortValidator } from '../validators/likeSort.validator';

export class LikeQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(LikeSortValidator)
  sort: string;
}
