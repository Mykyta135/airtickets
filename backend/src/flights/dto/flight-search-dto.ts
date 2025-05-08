import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsNumber, Min, Max, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class FlightSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  departureDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  departureDateStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  departureDateEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  departureAirportCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  arrivalAirportCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  airlineCode?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}