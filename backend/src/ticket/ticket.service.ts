import { Injectable, NotFoundException } from '@nestjs/common';
import * as pdfmake from 'pdfmake';
import { Response } from 'express';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService
  ) {}

  async generateTicketPdf(ticketId: string): Promise<Buffer> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        passenger: true,
        booking: true,
        flightSeat: { include: { flight: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        this.i18n.t('ticket.errors.not_found')
      );
    }

    const docDefinition = {
      content: [
        { 
          text: this.i18n.t('ticket.pdf.title'), 
          style: 'header' 
        },
        `${this.i18n.t('ticket.pdf.passenger_name')}: ${ticket.passenger.firstName} ${ticket.passenger.lastName}`,
        `${this.i18n.t('ticket.pdf.passenger_email')}: ${ticket.passenger.email}`,
        `${this.i18n.t('ticket.pdf.flight_number')}: ${ticket.flightSeat.flight.flightNumber}`,
        `${this.i18n.t('ticket.pdf.seat_number')}: ${ticket.flightSeat.seatNumber}`,
        `${this.i18n.t('ticket.pdf.booking_ref')}: ${ticket.booking.bookingReference}`,
        `${this.i18n.t('ticket.pdf.issued_at')}: ${ticket.issueDate.toLocaleString()}`,
      ],
      styles: {
        header: { 
          fontSize: 22, 
          bold: true, 
          margin: [0, 0, 0, 10] 
        },
      },
    };

    return new Promise((resolve, reject) => {
      const printer = new pdfmake({
        Roboto: {
          normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
          bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf',
          italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
          bolditalics: 'node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf',
        },
      });

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async getTicketsByBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(
        this.i18n.t('ticket.errors.booking_not_found')
      );
    }

    const tickets = await this.prisma.ticket.findMany({
      where: { bookingId },
      include: {
        passenger: true,
        flightSeat: { include: { flight: true } },
      },
    });

    return tickets.map((t) => ({
      ticketId: t.id,
      issuedAt: t.issueDate,
      passenger: {
        name: t.passenger.firstName,
        email: t.passenger.email,
      },
      seat: {
        number: t.flightSeat.seatNumber,
      },
      flight: {
        number: t.flightSeat.flight.flightNumber,
        departure: t.flightSeat.flight.departureTime,
        arrival: t.flightSeat.flight.arrivalTime,
      },
    }));
  }
}