import { Injectable, MiddlewareConsumer, Module, NestMiddleware } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FlightModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { MyProfileModule } from './myprofile/myprofile.module';
import { PurchaseModule } from './purchase/purchase.module';
import { TicketModule } from './ticket/ticket.module';
import { RefundModule } from './refund/refund.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { configure } from 'winston';
@Injectable()
export class LogHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Accept-Language:', req.headers['accept-language']);
    next();
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join('./src/i18n'), // Correct path to the i18n folder
        watch: true, // Enable for development
      },
      resolvers: [
        { use: AcceptLanguageResolver, options: { matchType: 'loose' } },
      ],
    }),
    PrismaModule,
    FlightModule,
    AuthModule,
    MyProfileModule,
    PurchaseModule,
    TicketModule,
    RefundModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogHeaderMiddleware).forRoutes('*');
  }
}
