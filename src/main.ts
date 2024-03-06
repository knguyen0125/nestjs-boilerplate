import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Setup Pino Logger
  app.useLogger(app.get(Logger));

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

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