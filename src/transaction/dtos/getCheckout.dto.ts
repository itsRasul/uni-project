import { IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetCheckoutDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsMobilePhone()
  @IsOptional()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  Description: string;

  @IsNotEmpty()
  @IsNumber()
  address: number
}
