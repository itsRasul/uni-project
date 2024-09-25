import { IsEnum, IsNotEmpty } from 'class-validator';
import { shippingInfoStatusEnum } from '../enums/shippingInfoStatus.enum';

export class UpdateShippingInfoDto {
  @IsEnum(shippingInfoStatusEnum)
  @IsNotEmpty()
  status: shippingInfoStatusEnum;
}
