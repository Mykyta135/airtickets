import { Module } from '@nestjs/common';
import { MyProfileController } from './myprofile.controller';
import { MyProfileService } from './myprofile.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MyProfileController],
  providers: [MyProfileService],
  exports: [MyProfileService],
})
export class MyProfileModule {}