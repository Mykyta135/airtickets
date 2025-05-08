import { Controller, Get, Param, Query, ParseIntPipe, ParseFloatPipe, BadRequestException } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { FlightSearchParams, FlightService } from './flights.service';

@ApiTags('flights')
@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter flights' })
  @ApiQuery({ name: 'departureDate', required: false, type: Date })
  @ApiQuery({ name: 'departureDateStart', required: false, type: Date })
  @ApiQuery({ name: 'departureDateEnd', required: false, type: Date })
  @ApiQuery({ name: 'departureAirportCode', required: false })
  @ApiQuery({ name: 'arrivalAirportCode', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'airlineCode', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a paginated list of flights that match the filter criteria' 
  })
  async findAll(
    @Query('departureDate') departureDate?: string,
    @Query('departureDateStart') departureDateStart?: string,
    @Query('departureDateEnd') departureDateEnd?: string,
    @Query('departureAirportCode') departureAirportCode?: string,
    @Query('arrivalAirportCode') arrivalAirportCode?: string,
    @Query('minPrice', new ParseFloatPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true })) maxPrice?: number,
    @Query('airlineCode') airlineCode?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    try {
      const params: FlightSearchParams = {
        departureDate: departureDate ? new Date(departureDate) : undefined,
        departureDateStart: departureDateStart ? new Date(departureDateStart) : undefined,
        departureDateEnd: departureDateEnd ? new Date(departureDateEnd) : undefined,
        departureAirportCode,
        arrivalAirportCode,
        minPrice,
        maxPrice,
        airlineCode,
        page,
        limit,
      };
      
      return this.flightService.findAll(params);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight by ID' })
  @ApiParam({ name: 'id', description: 'Flight ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the flight with the specified ID' 
  })
  async findOne(@Param('id') id: string) {
    return this.flightService.findById(id);
  }

  @ApiTags('Airports')
  @Get('airports/search')
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query for airport name, code, or city',
    type: String,
  })
  @ApiOkResponse({
    description: 'List of matched airports',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          city: { type: 'string' },
        },
      },
    },
  })
  @Get('airports/search')
  async searchAirports(@Query('q') query: string) {
    return this.flightService.searchAirports(query);
  }

  @Get('airports/:id')
  async searchAirportById(@Param('id') id: string) {
    return this.flightService.searchAirportById(id);
  }

  @ApiTags('Airlines')
  @Get('airlines/search')
  async searchAirlines() {
    return this.flightService.getAllAirlines();
  }

  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query for airport name, code, or city',
    type: String,
  })
  @Get('airline/search')
  async searchAirlineById(@Query('q') query: string) {
    return this.flightService.searchAirlineById(query);
  }
  
}