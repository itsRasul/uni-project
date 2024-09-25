import { IsNotEmpty, IsNumber, IsOptional, IsPositive, Length } from 'class-validator';

export class UpdateMyCartDto {
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
