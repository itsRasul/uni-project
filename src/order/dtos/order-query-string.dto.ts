import { IsEnum, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { OrderSortValidator } from '../validators/order.validator';
import { orderStatusEnum } from '../enums/orderStatus.enum';

export class OrderQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(OrderSortValidator)
  sort: string;

  @IsOptional()
  @Validate(OperatorValidator)
  finalPrice: filterType;

  @IsOptional()
  @Validate(OperatorValidator)
  totalPrice: filterType;

  @IsOptional()
  @IsEnum(orderStatusEnum)
  status: orderStatusEnum;
}
