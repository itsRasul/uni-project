import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Password1234',
    minLength: 8,
    maxLength: 32,
    description:
      'The password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'The password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @MaxLength(32)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
