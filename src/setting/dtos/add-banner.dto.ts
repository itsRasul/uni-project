import { LikeController } from './../../like/like.controller';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddBannerDto {
  @IsOptional()
  @IsString()
  photo: string;

  @IsString()
  link: string;
}
