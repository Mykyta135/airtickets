import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMaxSize, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ReserveFlightDto {
  @ApiProperty({ description: 'Flight ID to reserve' })
  @IsString()
  @IsNotEmpty()
  flightId: string;

  @ApiProperty({ description: 'Seat IDs to reserve', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(9)
  seatIds: string[];

  // This will be injected from JWT in controller
  userId: string;
}

export class PassengerDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Passport number' })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @ApiProperty({ description: 'Date of birth in ISO format (YYYY-MM-DD)' })
  @IsISO8601()
  dateOfBirth: Date;

  @ApiProperty({ description: 'Nationality' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ description: 'Seat ID (optional)', required: false })
  @IsString()
  @IsOptional()
  seatId?: string;
}

export class AddPassengerDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  seatId?: string;  // Ensure this is a valid seat ID
}

export class AddPassengersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddPassengerDto)
  passengers: AddPassengerDto[];
}


export class SeatAssignment {
  @ApiProperty({ description: 'Passenger email' })
  @IsEmail()
  passengerEmail: string;

  @ApiProperty({ description: 'Seat number' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;
}

export class SeatAssignmentDto {
  @ApiProperty({ 
    description: 'Seat assignments', 
    type: [SeatAssignment]
  })
  @ValidateNested({ each: true })
  @Type(() => SeatAssignment)
  assignments: SeatAssignment[];
}

export class ConfirmBookingDto {
  @ApiProperty({ description: 'Agreement to terms and conditions' })
  @IsBoolean()
  agreeToTerms: boolean;
}

export class CardDetailsDto {
  @ApiProperty({ description: 'Card number' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ description: 'Expiry date (MM/YY)' })
  @IsString()
  @IsNotEmpty()
  expiry: string;

  @ApiProperty({ description: 'CVV code' })
  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class MakePaymentDto {
  @ApiProperty({ 
    description: 'Payment method',
    enum: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER']
  })
  @IsEnum(['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'])
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';

  @ApiProperty({ description: 'Card details (required for CREDIT_CARD)', required: false })
  @ValidateNested()
  @Type(() => CardDetailsDto)
  @IsOptional()
  cardDetails?: CardDetailsDto;
}