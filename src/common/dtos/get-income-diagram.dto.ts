import { IsNotEmpty, IsNumber, IsOptional, Validate } from 'class-validator';
import { LimitValidator } from '../validators/limit.validator';
import { PageValidator } from '../validators/page.validator';

export class GetIncomeDiagramDto {
    @IsNumber()
    @IsNotEmpty()
    mounth: number;

    @IsNumber()
    @IsNotEmpty()
    year: number
}
