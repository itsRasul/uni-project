import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteSliderDto {
  @IsNotEmpty()
  @IsString()
  imgSlider: string;
}
