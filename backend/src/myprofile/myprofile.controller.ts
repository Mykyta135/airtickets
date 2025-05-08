import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MyProfileService } from './myprofile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('myprofile')
@Controller('myprofile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyProfileController {
  constructor(private readonly myProfileService: MyProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Request() req) {
    return this.myProfileService.getProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.myProfileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get user booking history' })
  @ApiResponse({ status: 200, description: 'Returns the user booking history' })
  async getBookingHistory(@Request() req) {
    return this.myProfileService.getBookingHistory(req.user.id);
  }
}