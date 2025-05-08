import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { I18nService } from 'nestjs-i18n';


@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
  
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });
  
    if (existingUser) {
      throw new ConflictException(
        await this.i18n.t('auth.email_already_registered'),
      );
    }
  
    const passwordHash = await bcrypt.hash(password, 10);
  
    const user = await this.prismaService.user.create({
      data: {
        email,
        passwordHash,
        isVerified: true,
        passenger: {
          create: {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email: registerDto.email,
          },
        },
      },
    });
  
    const token = this.generateToken(user.id, user.email);
  
    return {
      id: user.id,
      email: user.email,
      token,
      message: await this.i18n.t('auth.registration_success'),
    };
  }
  

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
  
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new UnauthorizedException(
        await this.i18n.t('auth.invalid_credentials'),
      );
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        await this.i18n.t('auth.invalid_credentials'),
      );
    }
  
    const token = this.generateToken(user.id, user.email);
  
    return {
      id: user.id,
      email: user.email,
      token,
      message: await this.i18n.t('auth.login_success'),
    };
  }
  
  generateToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(payload: JwtPayload) {
    const { sub } = payload;
    const user = await this.prismaService.user.findUnique({
      where: { id: sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}