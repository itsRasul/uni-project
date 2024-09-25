import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  MinLength,
  MaxLength,
  IsMobilePhone,
  IsEmail,
  IsNotEmptyObject,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { countryEnum } from 'src/address/enums/country.enum';
import { provinceEnum } from 'src/address/enums/province.enum';
import { cityEnum } from 'src/address/enums/city.enum';

class UserAddressDto {
  @IsEnum(countryEnum)
  country: countryEnum;

  @IsEnum(provinceEnum)
  province: provinceEnum;

  @IsEnum(cityEnum)
  city: cityEnum;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  postCode: string;
}

class CooperatorDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  @IsMobilePhone('fa-IR', {}, { message: 'please enter a valid phone number' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'please entre a valid email' })
  email: string;

  @IsNotEmptyObject()
  @Type(() => UserAddressDto)
  @ValidateNested()
  address: UserAddressDto;

  @IsArray()
  @IsNumber({}, { each: true })
  categories: number[];
}

export class SignUpDistributorDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CooperatorDto)
  cooperator: CooperatorDto;
}
