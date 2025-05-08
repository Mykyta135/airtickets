import { Controller, Get, Param, Res } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Response } from 'express';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get tickets for a confirmed booking' })
  @ApiParam({ name: 'bookingId', type: String, description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking or tickets not found' })
  getTicketsByBooking(@Param('bookingId') bookingId: string) {
    return this.ticketService.getTicketsByBooking(bookingId);
  }

  @Get('ticket/:ticketId/pdf')
  @ApiOperation({ summary: 'Download ticket as PDF' })
  @ApiParam({ name: 'ticketId', type: 'string' })
  @ApiResponse({ status: 200, description: 'PDF ticket downloaded' })
  async downloadTicketPdf(
    @Param('ticketId') ticketId: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const buffer = await this.ticketService.generateTicketPdf(ticketId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${ticketId}.pdf"`,
    });

    res.send(buffer);
  }
}
