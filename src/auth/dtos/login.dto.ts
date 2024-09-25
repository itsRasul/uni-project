import {
  IsString,
  Length,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsMobilePhone,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    required: true,
    minLength: 8,
    maxLength: 32,
    example: 'Pass1234',
    description:
      'Password must contain at least one lowercase letter, one uppercase letter and one number',
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
}
