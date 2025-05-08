import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context, trace }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        // File transport for production logs
        new winston.transports.File({
          filename: 'logs/application-%DATE%.log',
          zippedArchive: true,
          maxsize: 20,
          maxFiles: 14,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Separate error log
        new winston.transports.File({
          filename: 'logs/error-%DATE%.log',
     
          zippedArchive: true,
          maxsize: 20,
          maxFiles: 30,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}