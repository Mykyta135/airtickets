import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Setup Swagger docs
  const config = new DocumentBuilder()
    .setTitle('Flight Booking API')
    .setDescription('The Flight Booking API')
    .setVersion('1.0')
    .addTag('flights')
    .addTag('myprofile')
    .addBearerAuth() 
    .addSecurity('Accept-Language', {
      type: 'apiKey',
      name: 'Accept-Language',
      in: 'header',
    })    
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // Important if you're using cookies
  });

  await app.listen(5005);
  console.log(`Application is running on: http://localhost:${5005}`);
}

bootstrap();