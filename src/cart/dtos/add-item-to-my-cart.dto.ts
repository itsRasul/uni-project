import { IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';

export class AddItemToMyCartDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
