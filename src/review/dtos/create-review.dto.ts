import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  comment: string;
}
