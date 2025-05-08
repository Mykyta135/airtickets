import { Controller, Post, Body, Param, UseGuards, Request, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { 
  AddPassengersDto, 
  ConfirmBookingDto, 
  MakePaymentDto, 
  ReserveFlightDto,
  SeatAssignmentDto 
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Purchase')
@Controller('purchase')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Reserve a flight and seats (10 minute hold)' })
  @ApiBody({ type: ReserveFlightDto })
  reserveFlight(@Request() req, @Body() dto: ReserveFlightDto) {
    // Get userId from JWT token
    const userId = req.user['id']
    return this.purchaseService.reserveFlight({ ...dto, userId });
  }

  @Post(':bookingId/passengers')
  @ApiOperation({ summary: 'Add passengers to the booking' })
  @ApiBody({ type: AddPassengersDto })
  addPassengers(
    @Request() req,
    @Param('bookingId') bookingId: string, 
    @Body() dto: AddPassengersDto
  ) {
    const userId = req.user['id']
    return this.purchaseService.addPassengers(bookingId, userId, dto);
  }

  @Post(':bookingId/assign-seats')
  @ApiOperation({ summary: 'Assign passengers to specific seats' })
  @ApiBody({ type: SeatAssignmentDto })
  assignSeats(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body() dto: SeatAssignmentDto
  ) {
    const userId = req.user['id']
    return this.purchaseService.assignSeats(bookingId, userId, dto);
  }

  @Post(':bookingId/confirm')
  @ApiOperation({ summary: 'Confirm booking before payment' })
  @ApiBody({ type: ConfirmBookingDto })
  confirmBooking(
    @Request() req,
    @Param('bookingId') bookingId: string, 
    @Body() dto: ConfirmBookingDto
  ) {
    const userId = req.user['id']
    return this.purchaseService.confirmBooking(bookingId, userId, dto);
  }

  @Post(':bookingId/pay')
  @ApiOperation({ summary: 'Simulate payment and issue tickets' })
  @ApiBody({ type: MakePaymentDto })
  makePayment(
    @Request() req,
    @Param('bookingId') bookingId: string, 
    @Body() dto: MakePaymentDto
  ) {
    const userId = req.user['id']
    return this.purchaseService.makePayment(bookingId, userId, dto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Booking details returned' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getBookingDetails(@Param('bookingId') bookingId: string, @Req() req: Request) {
    return this.purchaseService.getBookingDetails(bookingId, (req as any).user['id']);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get all bookings for the current user' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  getUserBookings(@Req() req: Request) {
    return this.purchaseService.getUserBookings((req as any).user['id']);
  }
  @Get('booking/:flightId')
  @ApiOperation({ summary: 'Get all bookings for the current user' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  getBookingByFlightId(@Req() req: Request) {
    return this.purchaseService.getUserBookings((req as any).user['id']);
  }
  
  @Get('booking/:bookingId/passengers')
  @ApiOperation({ summary: 'Get passengers for a booking' })
  @ApiResponse({ status: 200, description: 'List of passengers in the booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getPassengers(@Param('bookingId') bookingId: string, @Req() req: Request) {
    return this.purchaseService.getPassengers(bookingId, (req as any).user['id']);
  }
  @Get('available-seats/:flightId')
  @ApiOperation({ summary: 'Get all available seats for a flight' })
  @ApiResponse({ status: 200, description: 'List of available seats' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  getAvailableSeats(@Param('flightId') flightId: string) {
    return this.purchaseService.getAvailableSeats(flightId);
  }
}