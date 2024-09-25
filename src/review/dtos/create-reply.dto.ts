import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  comment: string;

  @IsOptional()
  @IsNumber()
  parentReply: number;
}
