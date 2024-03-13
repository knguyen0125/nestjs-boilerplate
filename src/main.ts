import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

console.log('hi');
async function bootstrap() {
  console.log('pre create');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  console.log('post create');

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

  console.log('hi');
  await app.listen(3000);
}

bootstrap();
