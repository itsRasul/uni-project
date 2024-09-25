import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CooperatorSortType } from '../enums/cooperatorSortType.enum';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { CooperatorSortValidator } from '../validators/cooperator.validator';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { CooperatorRoleEnum } from '../enums/cooperator-role.enum';
import { CooperatorCallStatusEnum } from '../enums/cooperator-call-status.enum';
import { CooperatorStatusEnum } from '../enums/cooperator-status.enum';

export class CooperatorQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(CooperatorSortValidator)
  sort: CooperatorSortType;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(11, 11)
  @IsMobilePhone('fa-IR', {}, { message: 'please enter a valid phone number' })
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  isPhoneNumberVerified: boolean;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'please entre a valid email' })
  email: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified: boolean;

  @IsOptional()
  @IsEnum(CooperatorRoleEnum)
  role: CooperatorRoleEnum;

  @IsOptional()
  @IsEnum(CooperatorCallStatusEnum)
  callStatus: CooperatorCallStatusEnum;

  @IsOptional()
  @IsEnum(CooperatorStatusEnum)
  status: CooperatorStatusEnum;
}
