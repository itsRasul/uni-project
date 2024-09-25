import { IsEnum, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { TransactionSortValidator } from '../validators/transactionSort.validator';
import { transactionTypeEnum } from '../enums/transactionType.enum';
import { transactionStatusEnum } from '../enums/transactionStatus.enum';

export class TransactionQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(TransactionSortValidator)
  sort: string;

  @IsOptional()
  @Validate(OperatorValidator)
  amount: filterType;

  @IsOptional()
  @IsEnum(transactionTypeEnum)
  type: transactionTypeEnum;

  @IsOptional()
  @IsEnum(transactionStatusEnum)
  status: transactionStatusEnum;

  @IsString()
  @IsOptional()
  Rrn: string;

  @IsString()
  @IsOptional()
  traceNo: string;
}
