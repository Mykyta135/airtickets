import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: i18nValidationMessage('validation.EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString({ message: i18nValidationMessage('validation.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  password: string;
}
