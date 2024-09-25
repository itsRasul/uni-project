import {
  IsEmail,
  IsEnum,
  IsIn,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OperatorValidator } from 'src/common/validators/operator.validator';
import { filterType } from 'src/common/types/filter.type';
import { UserSortValidator } from '../validators/userSort.validator';
import userRolesEnum from '../enums/userRoles.enum';

export class UserQueryStringDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[+-]/, { message: 'sort must start with "-" or "+"' })
  @Validate(UserSortValidator)
  sort: string;

  @IsOptional()
  @MinLength(3)
  firstName: string;

  @IsOptional()
  @MinLength(3)
  lastName: string;

  @Length(11, 11)
  @IsMobilePhone('fa-IR', {}, { message: 'please enter a valid phone number' })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'please entre a valid email' })
  @IsOptional()
  email: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  isPhoneNumberVerified: boolean;

  @IsOptional()
  @IsIn(['true', 'false'])
  isEmailVerified: boolean;

  @IsOptional()
  @IsEnum(userRolesEnum)
  role: userRolesEnum;
}
