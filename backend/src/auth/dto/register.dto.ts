import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsNotEmpty, IsString } from 'class-validator';
import {  } from 'class-validator-i18n';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: i18nValidationMessage('validation.STRING') })
  @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString({ message: i18nValidationMessage('validation.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: i18nValidationMessage('validation.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.REQUIRED') })
  lastName: string;
}
