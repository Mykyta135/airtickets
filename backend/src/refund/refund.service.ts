import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  Refund,
  RefundStatus,
  TicketStatus,
  PaymentStatus,
} from '@prisma/client';
import {
  CreateRefundDto,
  RefundFilterDto,
  UpdateRefundDto,
} from './dto/refund.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RefundService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(createRefundDto: CreateRefundDto): Promise<Refund> {
    const { ticketId, amount, reason } = createRefundDto;

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
            payments: true,
          },
        },
        refund: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        this.i18n.t('refund.errors.ticket_not_found', { args: { ticketId } }),
      );
    }

    if (ticket.refund) {
      throw new ConflictException(
        this.i18n.t('refund.errors.refund_exists', { args: { ticketId } }),
      );
    }

    if (ticket.status === TicketStatus.REFUNDED) {
      throw new ConflictException(
        this.i18n.t('refund.errors.already_refunded', { args: { ticketId } }),
      );
    }

    const refundableStatuses = new Set<TicketStatus>([
      TicketStatus.ISSUED,
      TicketStatus.CANCELLED,
    ]);
    if (!refundableStatuses.has(ticket.status)) {
      throw new BadRequestException(
        this.i18n.t('refund.errors.invalid_status', {
          args: {
            status: this.i18n.t(
              `refund.statuses.${ticket.status.toLowerCase()}`,
            ),
          },
        }),
      );
    }

    const payment = ticket.booking.payments.find(
      (p) => p.status === PaymentStatus.COMPLETED,
    );
    if (!payment) {
      throw new BadRequestException(this.i18n.t('refund.errors.no_payment'));
    }

    return this.prisma.$transaction(async (prisma) => {
      const refund = await prisma.refund.create({
        data: {
          amount,
          reason,
          status: RefundStatus.PENDING,
          ticket: {
            connect: {
              id: ticketId,
            },
          },
        },
      });

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.CANCELLED },
      });

      return {
        ...refund,
        message: this.i18n.t('refund.success.created'),
      };
    });
  }

  async findOne(id: string): Promise<Refund> {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            passenger: true,
            booking: true,
          },
        },
      },
    });

    if (!refund) {
      throw new NotFoundException(
        this.i18n.t('refund.errors.refund_not_found', { args: { id } }),
      );
    }

    return refund;
  }

  async findByTicket(ticketId: string): Promise<Refund> {
    const refund = await this.prisma.refund.findUnique({
      where: { ticketId },
      include: {
        ticket: true,
      },
    });

    if (!refund) {
      throw new NotFoundException(
        this.i18n.t('refund.errors.ticket_refund_not_found', {
          args: { ticketId },
        }),
      );
    }

    return refund;
  }

  async update(id: string, updateRefundDto: UpdateRefundDto): Promise<Refund> {
    const { status, reason } = updateRefundDto;
    const refund = await this.findOne(id);

    const processingRefund =
      status === RefundStatus.PROCESSED &&
      refund.status !== RefundStatus.PROCESSED;

    return this.prisma.$transaction(async (prisma) => {
      const updatedRefund = await prisma.refund.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(reason && { reason }),
          ...(processingRefund && { processedDate: new Date() }),
        },
      });

      if (processingRefund) {
        const ticket = await prisma.ticket.findUnique({
          where: { id: refund.ticketId },
          include: { booking: true },
        });

        if (ticket?.booking) {
          await prisma.payment.updateMany({
            where: {
              bookingId: ticket.booking.id,
              status: PaymentStatus.COMPLETED,
            },
            data: { status: PaymentStatus.REFUNDED },
          });
        }
      }

      return {
        ...updatedRefund,
        message: this.i18n.t('refund.success.updated'),
      };
    });
  }

  async remove(id: string): Promise<Refund> {
    const refund = await this.findOne(id);

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(
        this.i18n.t('refund.errors.delete_not_allowed', {
          args: { status: refund.status },
        }),
      );
    }

    const deletedRefund = await this.prisma.refund.delete({
      where: { id },
    });

    return {
      ...deletedRefund,
    };
  }

  async findAll(filters?: RefundFilterDto): Promise<Refund[]> {
    const where = {};

    if (filters?.status) {
      where['status'] = filters.status;
    }

    if (filters?.ticketId) {
      where['ticketId'] = filters.ticketId;
    }

    return this.prisma.refund.findMany({
      where,
      include: {
        ticket: {
          include: {
            passenger: true,
            booking: true,
          },
        },
      },
    });
  }
}
