import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MyProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        passenger: true,
      },
    });

    if (!user || !user.passenger) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      profile: {
        id: user.passenger.id,
        firstName: user.passenger.firstName,
        lastName: user.passenger.lastName,
        email: user.passenger.email,
        phone: user.passenger.phone,
        passportNumber: user.passenger.passportNumber,
        dateOfBirth: user.passenger.dateOfBirth,
        nationality: user.passenger.nationality,
      },
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        passenger: true,
      },
    });

    if (!user || !user.passenger) {
      throw new NotFoundException('Profile not found');
    }

    const updatedPassenger = await this.prismaService.passenger.update({
      where: { id: user.passenger.id },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        passportNumber: updateProfileDto.passportNumber,
        dateOfBirth: updateProfileDto.dateOfBirth 
          ? new Date(updateProfileDto.dateOfBirth) 
          : undefined,
        nationality: updateProfileDto.nationality,
      },
    });

    return {
      id: user.id,
      email: user.email,
      profile: {
        id: updatedPassenger.id,
        firstName: updatedPassenger.firstName,
        lastName: updatedPassenger.lastName,
        email: updatedPassenger.email,
        phone: updatedPassenger.phone,
        passportNumber: updatedPassenger.passportNumber,
        dateOfBirth: updatedPassenger.dateOfBirth,
        nationality: updatedPassenger.nationality,
      },
    };
  }

  async getBookingHistory(userId: string) {
    const bookings = await this.prismaService.booking.findMany({
      where: {
        userId: userId,
      },
      include: {
        flight: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
          }
        },
        tickets: {
          include: {
            passenger: true,
            flightSeat: true,
          }
        },
        payments: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    return bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      bookingDate: booking.bookingDate,
      status: booking.status,
      totalAmount: booking.totalAmount,
      flight: {
        id: booking.flight.id,
        flightNumber: booking.flight.flightNumber,
        departureTime: booking.flight.departureTime,
        arrivalTime: booking.flight.arrivalTime,
        airline: {
          name: booking.flight.airline.name,
          code: booking.flight.airline.code,
        },
        departureAirport: {
          code: booking.flight.departureAirport.code,
          city: booking.flight.departureAirport.city,
          country: booking.flight.departureAirport.country,
        },
        arrivalAirport: {
          code: booking.flight.arrivalAirport.code,
          city: booking.flight.arrivalAirport.city,
          country: booking.flight.arrivalAirport.country,
        },
      },
      tickets: booking.tickets.map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        passenger: {
          firstName: ticket.passenger.firstName,
          lastName: ticket.passenger.lastName,
        },
        seat: {
          seatNumber: ticket.flightSeat.seatNumber,
          seatClass: ticket.flightSeat.seatClass,
        }
      })),
      payments: booking.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate,
      })),
    }));
  }
}