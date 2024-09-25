import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    type: String,
    required: true,
    examples: ['myEmail@gmail.com', '09390000000'],
    description: 'must be a valid email or a valid phoneNumber',
  })
  @IsNotEmpty()
  @IsString()
  emailOrPhoneNumber: string;
}
