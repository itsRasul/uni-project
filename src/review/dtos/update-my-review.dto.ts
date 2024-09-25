import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max, IsInt, IsEnum } from 'class-validator';

export class UpdateMyReviewDto {
  @ApiProperty({
    minimum: 1,
    maximum: 5,
    type: Number,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsInt()
  @IsOptional()
  rating: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  comment: string;
}
