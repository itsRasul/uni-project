import { IsEnum, IsOptional, isObject } from 'class-validator';
import { CooperatorStatusEnum } from './../enums/cooperator-status.enum';
import { CooperatorCallStatusEnum } from '../enums/cooperator-call-status.enum';
export class UpdateCooperatorDto {
  @IsEnum(CooperatorStatusEnum)
  @IsOptional()
  status: CooperatorStatusEnum;

  @IsEnum(CooperatorCallStatusEnum)
  @IsOptional()
  callStatus: CooperatorCallStatusEnum;
}
