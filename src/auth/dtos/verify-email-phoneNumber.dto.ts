import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class VerifyEmailPhoneNumberDto {
  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 6,
    required: true,
    description: 'enter verification code which was sended to your phone number or email',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  verificationCode: string;
}
