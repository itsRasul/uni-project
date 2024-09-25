import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteBannerDto {
  @IsNotEmpty()
  @IsString()
  imgBanner: string;
}
