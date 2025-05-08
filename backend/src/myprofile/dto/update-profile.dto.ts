import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsISO8601, Length, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'First name of the passenger' })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ description: 'Last name of the passenger' })
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ description: 'Phone number of the passenger', required: false })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({ description: 'Passport number of the passenger', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  passportNumber?: string;

  @ApiProperty({ description: 'Date of birth of the passenger', required: false })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Please provide a valid date in ISO 8601 format' })
  dateOfBirth?: string;

  @ApiProperty({ description: 'Nationality of the passenger', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;
}