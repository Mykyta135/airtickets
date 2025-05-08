import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

export type FlightSearchParams = {
  departureDate?: Date;
  departureDateStart?: Date;
  departureDateEnd?: Date;
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  minPrice?: number;
  maxPrice?: number;
  airlineCode?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class FlightService {
  constructor(private prisma: PrismaService, private readonly i18n: I18nService) {}

  async findAll(params: FlightSearchParams) {
    const {
      departureDate,
      departureDateStart,
      departureDateEnd,
      departureAirportCode,
      arrivalAirportCode,
      minPrice,
      maxPrice,
      airlineCode,
      page = 1,
      limit = 10,
    } = params;

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Build the where condition based on filters
    const where: Prisma.FlightWhereInput = {};

    // Filter by exact departure date if provided
    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(departureDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter by departure date range if provided
    if (departureDateStart || departureDateEnd) {
      where.departureTime = {
        ...(departureDateStart && { gte: departureDateStart }),
        ...(departureDateEnd && { lte: departureDateEnd }),
      };
    }

    // Filter by departure airport
    if (departureAirportCode) {
      where.departureAirport = {
        code: departureAirportCode,
      };
    }

    // Filter by arrival airport
    if (arrivalAirportCode) {
      where.arrivalAirport = {
        code: arrivalAirportCode,
      };
    }

    // Filter by airline
    if (airlineCode) {
      where.airline = {
        code: airlineCode,
      };
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.baseFare = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Get total count for pagination
    const totalCount = await this.prisma.flight.count({ where });

    // Execute the query with filters, includes, and pagination
    const flights = await this.prisma.flight.findMany({
      where,
      include: {
        airline: true,
        departureAirport: true,
        arrivalAirport: true,
        flightSeats: {
          where: {
            isAvailable: true,
          },
          select: {
            seatClass: true,
            price: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        departureTime: 'asc',
      },
    });

    // Calculate lowest seat price for each flight
    const flightsWithLowestPrice = flights.map((flight) => {
      const lowestPrice =
        flight.flightSeats.length > 0
          ? Math.min(...flight.flightSeats.map((seat) => Number(seat.price)))
          : Number(flight.baseFare);

      return {
        ...flight,
        lowestPrice,
      };
    });

    return {
      data: flightsWithLowestPrice,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findById(id: string) {

    const flight = this.prisma.flight.findUnique({
      where: { id },
      include: {
        airline: true,
        departureAirport: true,
        arrivalAirport: true,
        flightSeats: {
          orderBy: {
            price: 'asc',
          },
        },
      },
    });
    if (!flight) {
      throw new NotFoundException(
        this.i18n.t('flight.errors.not_found'),
      );
    }
    return flight;
  }
  async searchAirports(query: string) {
    if (!query || query.length < 2) {
      throw new BadRequestException(
        this.i18n.t('flight.errors.invalid_query'),
      );
    }

    return this.prisma.airport.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  }
  async getAllAirlines() {
    return this.prisma.airline.findMany();
  }
  async searchAirlineById(query: string) {
    const airline = await this.prisma.airline.findUnique({
      where: { id: query },
    });

    if (!airline) {
      throw new NotFoundException(
        this.i18n.t('flight.errors.airline_not_found'),
      );
    }
    return airline;
  }

  async searchAirportById(id: string) {
    const airport = await this.prisma.airport.findUnique({
      where: { id },
    });

    if (!airport) {
      throw new NotFoundException(
        this.i18n.t('flight.errors.airport_not_found'),
      );
    }
    return airport;
  }
}
