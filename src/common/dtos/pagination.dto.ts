import { IsOptional, Validate } from 'class-validator';
import { LimitValidator } from '../validators/limit.validator';
import { PageValidator } from '../validators/page.validator';

export class PaginationDto {
  @Validate(LimitValidator)
  @IsOptional()
  limit: number;

  @IsOptional()
  @Validate(PageValidator)
  page: number;
}
