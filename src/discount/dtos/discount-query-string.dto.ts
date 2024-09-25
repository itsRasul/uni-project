import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { filterType } from 'src/common/types/filter.type';
import { DiscountSortValidator } from '../validators/DiscountSort.validator';
import { discountTypeEnum } from '../enums/discountType.enum';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { discountStatusEnum } from '../enums/discountStatus.enum';

export class DiscountQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(DiscountSortValidator)
  sort: string;

  @IsOptional()
  @IsEnum(discountTypeEnum)
  type: discountTypeEnum;

  // @IsOptional()
  // @IsIn(['true', 'false'])
  // active: boolean;

  @IsOptional()
  @IsEnum(discountStatusEnum)
  status: discountStatusEnum;
}
