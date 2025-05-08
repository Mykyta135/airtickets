import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddPassengersDto,
  ConfirmBookingDto,
  MakePaymentDto,
  ReserveFlightDto,
  SeatAssignmentDto,
} from './dto';
import { Ticket, Prisma, BookingPassenger } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

// Maximum passengers per booking
const MAX_PASSENGERS = 9;
// Hold duration in milliseconds (10 minutes)
const HOLD_DURATION = 10 * 60 * 1000;

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService
  ) {}

  // Step 1: Reserve flight and seats
  async reserveFlight(dto: ReserveFlightDto) {
    const { flightId, seatIds, userId } = dto;

    // Validate seat count
    if (seatIds.length > MAX_PASSENGERS) {
      throw new BadRequestException(
        this.i18n.t('purchase.errors.max_passengers', { 
          args: { max: MAX_PASSENGERS } 
        })
      );
    }

    // Transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // Check flight exists
      const flight = await tx.flight.findUnique({ where: { id: flightId } });
      if (!flight) {
        throw new NotFoundException(this.i18n.t('purchase.errors.flight_not_found'));
      }

      // Lock seats
      const seats = await tx.flightSeat.findMany({
        where: {
          flightId,
          seatNumber: { in: seatIds },
          isAvailable: true,
        },
      });
      if (!flight) {
        throw new NotFoundException(
          this.i18n.t('purchase.errors.flight_not_found')
        );
      }
  
      if (seats.length !== seatIds.length) {
        throw new BadRequestException(
          this.i18n.t('purchase.errors.seats_unavailable')
        );
      }

      // Mark seats as unavailable (hold)
      await tx.flightSeat.updateMany({
        where: { id: { in: seats.map((s) => s.id) } },
        data: { isAvailable: false },
      });

      // Create booking with status PENDING and expiry timestamp
      const totalAmount = seats.reduce((sum, s) => sum + Number(s.price), 0);
      const bookingReference = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const booking = await tx.booking.create({
        data: {
          flightId,
          userId,
          totalAmount,
          status: 'PENDING',
          bookingReference,
          // Store reserved seat IDs for later use
          reservedSeatIds: seats.map((s) => s.id),
        },
      });

      // Store seat reservation details
      for (const seat of seats) {
        await tx.seatReservation.create({
          data: {
            bookingId: booking.id,
            flightSeatId: seat.id,
            // Passenger will be assigned later
          },
        });
      }

      return {
        message: this.i18n.t('purchase.success.reserved'),
        bookingId: booking.id,
        reservedSeats: seats.map((s) => ({
          id: s.id,
          seatNumber: s.seatNumber,
          class: s.seatClass,
        })),
        expiresAt: new Date(Date.now() + HOLD_DURATION),
      };
    });
  }

  // Step 2: Add passengers
  async addPassengers(
    bookingId: string,
    userId: string,
    dto: AddPassengersDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });
  
      if (!booking) {
        throw new NotFoundException(
          this.i18n.t('purchase.errors.booking_not_found')
        );
      }
  
      if (booking.userId !== userId) {
        throw new ForbiddenException(
          this.i18n.t('purchase.errors.access_denied')
        );
      }
  
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(this.i18n.t('purchase.errors.invalid_state'));
      }
  
      if (dto.passengers.length > MAX_PASSENGERS) {
        throw new BadRequestException(
          this.i18n.t('purchase.errors.max_passengers', { args: { max: MAX_PASSENGERS } })
        );
      }
  
      // ✅ Validate no duplicate passengers in request
      const emails = dto.passengers.map(p => p.email);
      const uniqueEmails = new Set(emails);
      if (emails.length !== uniqueEmails.size) {
        throw new BadRequestException(
          this.i18n.t('purchase.errors.duplicate_passengers')
        );
      }
  
      const seatReservations = await tx.seatReservation.findMany({
        where: { bookingId },
      });
  
      if (seatReservations.length < dto.passengers.length) {
        throw new BadRequestException(this.i18n.t('purchase.errors.not_enough_seats'));
      }
  
      const usedSeatIds = new Set<string>();
      const bookingPassengers: BookingPassenger[] = [];
  
      for (let i = 0; i < dto.passengers.length; i++) {
        const p = dto.passengers[i];
  
        // ✅ Must already exist in DB
        const passenger = await tx.passenger.findUnique({
          where: { email: p.email },
        });
        if (!passenger) {
          throw new BadRequestException(
            this.i18n.t('purchase.errors.passenger_not_found', { args: { email: p.email } })
          );
        }
  
        // ✅ Prevent duplicate (bookingId, passengerId)
        const alreadyLinked = await tx.bookingPassenger.findFirst({
          where: {
            bookingId,
            passengerId: passenger.id,
          },
        });
        if (alreadyLinked) {
          throw new BadRequestException(
            this.i18n.t('purchase.errors.already_linked', { args: { email: p.email } })
          );
        }
  
        // ✅ Create booking-passenger link
        const bookingPassenger = await tx.bookingPassenger.create({
          data: {
            bookingId,
            passengerId: passenger.id,
            isMainContact: i === 0,
          },
        });
  
        bookingPassengers.push(bookingPassenger);
  
        // ✅ Seat assignment
        if (p.seatId) {
          if (usedSeatIds.has(p.seatId)) {
            throw new BadRequestException(
              this.i18n.t('purchase.errors.seat_already_assigned', { args: { seatId: p.seatId } })
            );
          }
  
          const reservation = seatReservations.find(
            (sr) => sr.flightSeatId === p.seatId,
          );
          if (!reservation) {
            throw new BadRequestException(
              this.i18n.t('purchase.errors.seat_not_reserved', { args: { seatId: p.seatId } })
            );
          }

          if (reservation.passengerId) {
            throw new BadRequestException(
              `Seat ID ${p.seatId} is already assigned to another passenger`,
            );
          }
  
          // ✅ Assign seat
          await tx.seatReservation.update({
            where: { id: reservation.id },
            data: { passengerId: passenger.id },
          });
  
          usedSeatIds.add(p.seatId);
        }
      }
  
      return {
        message: this.i18n.t('purchase.success.passengers_added'),
        bookingId,
        passengersAdded: bookingPassengers.length,
      };
    });
  }
  

  // Step 2.5: Assign seats to passengers (optional)
  async assignSeats(bookingId: string, userId: string, dto: SeatAssignmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      // Validate booking exists and belongs to user
      if (!booking) {
        throw new NotFoundException(
          this.i18n.t('purchase.errors.booking_not_found')
        );
      }

      if (booking.userId !== userId) {
        throw new ForbiddenException(
          this.i18n.t('purchase.errors.access_denied')
        );
      }

      if (booking.status !== 'PENDING') {
        throw new BadRequestException(
          this.i18n.t('purchase.errors.invalid_state')
        );
      }

      // Get all bookingPassengers
      const bookingPassengers = await tx.bookingPassenger.findMany({
        where: { bookingId },
        include: { passenger: true },
      });

      // Get all seat reservations
      const seatReservations = await tx.seatReservation.findMany({
        where: { bookingId },
        include: { flightSeat: true },
      });

      // Validate each assignment
      for (const assignment of dto.assignments) {
        const passenger = bookingPassengers.find(
          (bp) => bp.passenger.email === assignment.passengerEmail,
        );

        if (!passenger) {
          throw new BadRequestException(
            this.i18n.t('purchase.errors.passenger_not_in_booking', {
              args: { email: assignment.passengerEmail }
            })
          );
        }

        const seat = seatReservations.find(
          (sr) => sr.flightSeat.seatNumber === assignment.seatNumber,
        );

        if (!seat) {
          throw new BadRequestException(
            this.i18n.t('purchase.errors.seat_not_reserved', {
              args: { seatNumber: assignment.seatNumber }
            })
          );
        }

        // Update seat reservation
        await tx.seatReservation.update({
          where: { id: seat.id },
          data: { passengerId: passenger.passengerId },
        });
      }

      return {
        message: this.i18n.t('purchase.success.seats_assigned'),
        bookingId,
        assignmentsCompleted: dto.assignments.length,
      };
    });
  }

  // Step 3: Confirm booking
  async confirmBooking(
    bookingId: string,
    userId: string,
    dto: ConfirmBookingDto,
  ) {
    if (!dto.agreeToTerms) {
      throw new BadRequestException(this.i18n.t('purchase.errors.terms_not_accepted'));
    }
  
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          seatReservations: {
            include: {
              passenger: true,
              flightSeat: { include: { flight: true } },
            },
          },
        },
      });
  
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
  
      if (booking.userId !== userId) {
        throw new ForbiddenException('You do not have access to this booking');
      }
  
      if (booking.status !== 'PENDING') {
        throw new BadRequestException('Booking is no longer in pending state');
      }
  
      const passengerCount = await tx.bookingPassenger.count({
        where: { bookingId },
      });
  
      if (passengerCount === 0) {
        throw new BadRequestException(this.i18n.t('purchase.errors.no_passengers'));
      }
  
      // Ensure all seat reservations have passengers
      const unassigned = booking.seatReservations.find((r) => !r.passengerId);
      if (unassigned) {
        throw new BadRequestException(this.i18n.t('purchase.errors.unassigned_seats'));
      }
  
      // Confirm the booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });
  
      // Create tickets
      for (const reservation of booking.seatReservations) {
        await tx.ticket.create({
          data: {
            bookingId,
            passengerId: reservation.passengerId!,
            flightSeatId: reservation.flightSeatId,
            issueDate: new Date(),
            ticketNumber: reservation.flightSeat.seatNumber
          },
        });
      }
  
      return {
        message: this.i18n.t('purchase.success.booking_confirmed'),
        bookingId: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
      };
    });
  }
  
  // Step 4: Simulate payment and issue tickets
  async makePayment(bookingId: string, userId: string, dto: MakePaymentDto) {
    // Use transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      // Validate booking exists and belongs to user
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new ForbiddenException('You do not have access to this booking');
      }

      if (booking.status !== 'CONFIRMED') {
        throw new BadRequestException('Booking not confirmed');
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          paymentMethod: dto.paymentMethod,
          status: 'COMPLETED',
          transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      });

      // Get seat reservations with passenger assignments
      const seatReservations = await tx.seatReservation.findMany({
        where: { bookingId },
        include: { flightSeat: true },
      });

      // Check if seat assignments are complete
      const unassignedSeats = seatReservations.filter((sr) => !sr.passengerId);
      if (unassignedSeats.length > 0) {
        // Auto-assign remaining seats
        const bookingPassengers = await tx.bookingPassenger.findMany({
          where: { bookingId },
        });

        const assignedPassengerIds = seatReservations
          .filter((sr) => sr.passengerId)
          .map((sr) => sr.passengerId);

        const unassignedPassengers = bookingPassengers.filter(
          (bp) => !assignedPassengerIds.includes(bp.passengerId),
        );

        // Match unassigned passengers with unassigned seats
        for (
          let i = 0;
          i < Math.min(unassignedSeats.length, unassignedPassengers.length);
          i++
        ) {
          await tx.seatReservation.update({
            where: { id: unassignedSeats[i].id },
            data: { passengerId: unassignedPassengers[i].passengerId },
          });
        }

        // Refresh seat reservations
        const updatedReservations = await tx.seatReservation.findMany({
          where: { bookingId },
        });

        // Verify all seats are assigned
        if (updatedReservations.some((r) => !r.passengerId)) {
          throw new BadRequestException(this.i18n.t('purchase.errors.unassigned_seats'));
        }
      }

      // Generate tickets
      const tickets: Ticket[] = [];
      for (const reservation of seatReservations) {
        if (!reservation.passengerId) {
          continue; // Skip unassigned seats (shouldn't happen after auto-assignment)
        }

        const ticket = await tx.ticket.create({
          data: {
            bookingId,
            passengerId: reservation.passengerId,
            flightSeatId: reservation.flightSeatId,
            status: 'ISSUED',
            ticketNumber: `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          },
        });

        tickets.push(ticket);
      }

      // Mark booking complete
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });

      return {
        message: this.i18n.t('purchase.success.payment_success') ,
        bookingId,
        transactionId: payment.transactionId,
        tickets,
      };
    });
  }
  async getBookingDetails(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: true,
        seatReservations: {
          include: {
            flightSeat: true,
            passenger: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
          },
        },
        payments: true,
        tickets: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(this.i18n.t('purchase.errors.booking_not_found'));
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('purchase.errors.access_denied'));
    }

    return booking;
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        flight: true,
        tickets: true,
        payments: true,
      },
    });
  }
  async getAvailableSeats(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new NotFoundException(this.i18n.t('purchase.errors.flight_not_found'));
    }

    const seats = await this.prisma.flightSeat.findMany({
      where: {
        flightId,
        isAvailable: true,
      },
      orderBy: { seatNumber: 'asc' },
    });

    return seats;
  }
  async getPassengers(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(this.i18n.t('purchase.errors.booking_not_found'));
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('purchase.errors.access_denied'));
    }

    return this.prisma.bookingPassenger.findMany({
      where: { bookingId },
      include: { passenger: true },
    });
  }

  
  // Cron job to cancel expired PENDING bookings and release seats
  @Cron('*/1 * * * *') // runs every minute
  async cleanupExpiredHolds() {
    const expirationCutoff = new Date(Date.now() - HOLD_DURATION);

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Find pending bookings older than cutoff
      const expired = await tx.booking.findMany({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'CONFIRMED' },
          ],
          bookingDate: { lt: expirationCutoff },
        },
      });

      for (const booking of expired) {
        // Get seat reservations
        const seatReservations = await tx.seatReservation.findMany({
          where: { bookingId: booking.id },
        });

        // Release seats
        for (const reservation of seatReservations) {
          await tx.flightSeat.update({
            where: { id: reservation.flightSeatId },
            data: { isAvailable: true },
          });
        }

        // Delete seat reservations
        await tx.seatReservation.deleteMany({
          where: { bookingId: booking.id },
        });

        // Delete booking passengers
        await tx.bookingPassenger.deleteMany({
          where: { bookingId: booking.id },
        });

        // Cancel booking
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
      }
    });
  }
}
