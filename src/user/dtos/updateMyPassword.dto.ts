import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateMyPasswordDto {
  @ApiProperty({
    type: String,
    maxLength: 32,
    minLength: 8,
    description:
      'current password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'current password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @MaxLength(32)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    type: String,
    maxLength: 32,
    minLength: 8,
    description:
      'new Password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'new Password must contain at least one lowercase letter, one uppercase letter and one number',
  })
  @MaxLength(32)
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
