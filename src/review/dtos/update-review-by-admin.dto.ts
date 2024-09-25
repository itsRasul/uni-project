import { IsOptional, IsEnum } from 'class-validator';
import reviewStatusEnum from '../enums/reviewStatus.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewByAdminDto {
  @ApiProperty({
    type: reviewStatusEnum,
    enum: reviewStatusEnum,
    required: false,
    example: reviewStatusEnum.ACCEPTED,
  })
  @IsOptional()
  @IsEnum(reviewStatusEnum)
  status: reviewStatusEnum;
}
