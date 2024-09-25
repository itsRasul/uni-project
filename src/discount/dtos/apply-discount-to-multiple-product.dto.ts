import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class ApplyDiscountToMultipleProductDto {
    @IsArray()
    @IsNumber({}, {each: true})
    @IsNotEmpty()
    products: number[]
}
