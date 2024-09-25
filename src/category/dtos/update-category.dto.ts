import {  IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photo: string;

  @IsOptional()
  @IsNumber()
  priority: number;
}
