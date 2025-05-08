import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Patch, 
  Query,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { RefundService } from './refund.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRefundDto, RefundFilterDto, RefundResponseDto, UpdateRefundDto } from './dto/refund.dto';

``
@ApiTags('refunds')
@Controller('refunds')
@UseGuards(JwtAuthGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new refund request' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Refund request created successfully',
    type: RefundResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or ticket not eligible for refund' 
  })
  @ApiBearerAuth()
  async create(@Body() createRefundDto: CreateRefundDto) {
    return this.refundService.create(createRefundDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all refund requests' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all refunds',
    type: [RefundResponseDto]
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filters: RefundFilterDto) {
    return this.refundService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a refund request by ID' })
  @ApiParam({ name: 'id', description: 'Refund ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the refund request',
    type: RefundResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Refund not found' 
  })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.refundService.findOne(id);
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Get refund by ticket ID' })
  @ApiParam({ name: 'ticketId', description: 'Ticket ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the refund request for the ticket',
    type: RefundResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Refund not found' 
  })
  @ApiBearerAuth()
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.refundService.findByTicket(ticketId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a refund request status' })
  @ApiParam({ name: 'id', description: 'Refund ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Refund updated successfully',
    type: RefundResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Refund not found' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updateRefundDto: UpdateRefundDto
  ) {
    return this.refundService.update(id, updateRefundDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund deleted successfully',
    type: RefundResponseDto,
  })
  @ApiOperation({ summary: 'Delete a pending refund request' })
  @ApiParam({ name: 'id', description: 'Refund ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Refund deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Refund not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot delete non-pending refund' 
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.refundService.remove(id);
  }
}