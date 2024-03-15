import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.use(cookieParser());

  // Setup Pino Logger
  app.useLogger(app.get(Logger));

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Ensure that all incoming requests are validated
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable Graceful Shutdown
  app.enableShutdownHooks();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('NestJS Boilerplate')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
