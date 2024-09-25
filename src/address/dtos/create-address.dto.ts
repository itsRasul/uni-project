import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { countryEnum } from '../enums/country.enum';
import { cityEnum } from '../enums/city.enum';
import { provinceEnum } from '../enums/province.enum';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsEnum(countryEnum)
  country: countryEnum;

  @IsEnum(provinceEnum)
  @IsNotEmpty()
  province: provinceEnum;

  @IsEnum(cityEnum)
  @IsNotEmpty()
  city: cityEnum;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  postCode: string;
}
