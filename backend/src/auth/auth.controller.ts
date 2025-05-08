import { Controller, Post, Body, HttpCode, HttpStatus, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() registerDto: RegisterDto,
    @I18n() i18n: I18nContext, // Inject I18nService for translations
  ) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        const message = await i18n.t('auth.errors.email_registered');
        throw new ConflictException(message);
      }
      throw error; // rethrow if error is not a ConflictException
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext, // Inject I18nService for translations
  ) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const message = i18n.t('auth.errors.invalid_credentials');
        throw new UnauthorizedException(message);
      }
      throw error; // rethrow if error is not an UnauthorizedException
    }
  }
}
