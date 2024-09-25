import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
  IsOptional,
  IsMobilePhone,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    type: String,
    minLength: 3,
    maxLength: 64,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  firstName: string;

  @ApiProperty({
    type: String,
    minLength: 3,
    maxLength: 64,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  lastName: string;

  @ApiProperty({
    type: String,
    required: true,
    examples: ['myEmail@gmail.com', '09390000000'],
    description: 'must be a valid email or a valid phoneNumber',
  })
  @IsNotEmpty()
  @IsString()
  emailOrPhoneNumber: string;

  @ApiProperty({
    type: String,
    maxLength: 32,
    minLength: 8,
    description:
      'Password must contain at least one lowercase letter, one uppercase letter and one number',
    required: true,
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @MaxLength(32)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @Length(7, 7)
  inviteCode: string;
}
