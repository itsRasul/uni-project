import { IsNotEmpty, IsEnum, IsPositive, IsNumber, IsDate } from 'class-validator';
import { discountTypeEnum } from '../enums/discountType.enum';

export class CreateDiscountDto {
  @IsNotEmpty()
  @IsEnum(discountTypeEnum)
  type: discountTypeEnum;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;
}
