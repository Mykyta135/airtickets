import { ApiProperty } from '@nestjs/swagger';
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  SeatClass,
  TicketStatus,
} from '@prisma/client';

export class FlightDTO {
  @ApiProperty({ description: 'Flight ID' })
  id: string;

  @ApiProperty({ description: 'Flight number' })
  flightNumber: string;

  @ApiProperty({ description: 'Departure time' })
  departureTime: Date;

  @ApiProperty({ description: 'Arrival time' })
  arrivalTime: Date;

  @ApiProperty({ description: 'Airline details' })
  airline: airlineDTO;

  @ApiProperty({ description: 'Departure airport details' })
  departureAirport: AirportDTO;

  @ApiProperty({ description: 'Arrival airport details' })
  arrivalAirport: AirportDTO;
}
export class airlineDTO {
  @ApiProperty({ description: 'Airline name' })
  name: string;

  @ApiProperty({ description: 'Airline code' })
  code: string;
}
export class AirportDTO {
  @ApiProperty({ description: 'Airport code' })
  code: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'Country' })
  country: string;
}
export class seatDTO {
  @ApiProperty({ description: 'Seat number' })
  seatNumber: string;

  @ApiProperty({ description: 'Seat class', enum: SeatClass })
  seatClass: SeatClass;
}
export class PaymentDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment date' })
  paymentDate: Date;
}

export class PassangerDTO {
  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;
}

export class TicketDto {
  @ApiProperty({ description: 'Ticket ID' })
  id: string;

  @ApiProperty({ description: 'Ticket number' })
  ticketNumber: string;

  @ApiProperty({ description: 'Ticket status', enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty({ description: 'Passenger details' })
  passenger: PassangerDTO;

  @ApiProperty({ description: 'Seat details' })
  seat: seatDTO;
}

export class BookingHistoryResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'Booking reference number' })
  bookingReference: string;

  @ApiProperty({ description: 'Booking date' })
  bookingDate: Date;

  @ApiProperty({ description: 'Booking status', enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ description: 'Total amount of the booking' })
  totalAmount: number;

  @ApiProperty({ description: 'Flight details' })
  flight: FlightDTO;

  @ApiProperty({
    description: 'Tickets associated with the booking',
    type: [TicketDto],
  })
  tickets: TicketDto[];

  @ApiProperty({
    description: 'Payments associated with the booking',
    type: [PaymentDto],
  })
  payments: PaymentDto[];
}
