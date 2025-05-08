import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrismaService } from './prisma.service';


@Controller('prisma')
export class PrismaController {
  constructor(private readonly prismaService: PrismaService) {}

}
