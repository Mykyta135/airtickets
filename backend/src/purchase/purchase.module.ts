import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // for automatic cleanup of expired holds
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
})
export class PurchaseModule {}