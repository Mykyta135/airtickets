import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundStatus } from '@prisma/client';

export class CreateRefundDto {
  @ApiProperty({ description: 'The ID of the ticket to be refunded' })
  // @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ description: 'Refund amount', example: 120.50 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Reason for refund request' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateRefundDto {
  @ApiPropertyOptional({ 
    description: 'Status of the refund',
    enum: RefundStatus,
    example: 'APPROVED'
  })
  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RefundResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: RefundStatus })
  status: RefundStatus;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  requestDate: Date;

  @ApiProperty({ nullable: true })
  processedDate: Date | null;
}

export class RefundFilterDto {
  @ApiPropertyOptional({ enum: RefundStatus })
  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  ticketId?: string;
}