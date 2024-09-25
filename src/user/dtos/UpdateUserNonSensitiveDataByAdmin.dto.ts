import {
  IsString,
  Length,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
  IsEnum,
  ValidateNested,
  IsObject,
  IsEmpty,
  IsMobilePhone,
} from 'class-validator';
import userRolesEnum from '../enums/userRoles.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class updateUserNonSensitiveDataByAdminDto {
  @ApiProperty({
    required: false,
    example: 'Ali',
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @ApiProperty({
    required: false,
    example: 'Mohammadi',
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '09390000000',
    minLength: 11,
    maxLength: 11,
    description: 'value must be valid phone number',
  })
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  @IsMobilePhone('fa-IR', {}, { message: 'please enter a valid phone number' })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    required: false,
    example: 'Ali@gmail.com',
    description: 'value must be valid email',
  })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'please entre a valid email' })
  email: string;

  @ApiProperty({
    required: false,
    examples: ['admin', 'user'],
    enum: userRolesEnum,
    type: userRolesEnum,
  })
  @IsOptional()
  @IsEnum(userRolesEnum)
  role: userRolesEnum;
}
