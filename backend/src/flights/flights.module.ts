import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FlightController } from './flights.controller';
import { FlightService } from './flights.service';

@Module({
  imports: [PrismaModule],
  controllers: [FlightController],
  providers: [FlightService],
  exports: [FlightService],
})
export class FlightModule {}