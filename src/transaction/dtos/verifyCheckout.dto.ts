import {  IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyCheckoutDto {
  @MaxLength(36)
  @MinLength(36)
  @IsNotEmpty()
  @IsString()
  Authority: string;

  @IsIn(['OK', 'NOK'])
  @IsNotEmpty()
  @IsString()
  Status: string;
}
