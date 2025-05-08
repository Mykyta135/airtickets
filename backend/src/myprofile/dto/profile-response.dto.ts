import { ApiProperty } from '@nestjs/swagger';
export class ProfileDTO{
    @ApiProperty({ description: 'Passenger ID' })
    id: string;

    @ApiProperty({ description: 'First name' })
    firstName: string;

    @ApiProperty({ description: 'Last name' })
    lastName: string;

    @ApiProperty({ description: 'Email address' })
    email: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phone?: string;

    @ApiProperty({ description: 'Passport number', required: false })
    passportNumber?: string;

    @ApiProperty({ description: 'Date of birth', required: false })
    dateOfBirth?: Date;

    @ApiProperty({ description: 'Nationality', required: false })
    nationality?: string;
  };
export class ProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User profile information' })
  profile: ProfileDTO
}