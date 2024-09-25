import { LikeController } from './../../like/like.controller';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddSliderDto {
  @IsOptional()
  @IsString()
  photo: string;

  @IsString()
  link: string;
}
