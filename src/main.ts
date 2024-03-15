import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import session from 'express-session';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  // Setup Pino Logger
  app.useLogger(app.get(Logger));

  // Setup Cookie Parser
  const cookieSecret = (process.env.COOKIE_SECRET || 'secret').split(',');
  app.use(cookieParser(cookieSecret));

  // Setup Express Session
  const ioredis = app.get(getRedisConnectionToken(), { strict: false });
  const redisStore = new RedisStore({ client: ioredis, prefix: 'sess:' });
  app.use(
    session({
      store: redisStore,
      secret: cookieSecret,
      resave: false,
      saveUninitialized: false,
      name: process.env.SESSION_COOKIE_NAME || 'sid',
      cookie: {
        path: process.env.SESSION_COOKIE_PATH,
        domain: process.env.SESSION_COOKIE_DOMAIN,
        secure: process.env.SESSION_COOKIE_SECURE === 'true',
        httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY === 'true',
        maxAge: process.env.SESSION_COOKIE_MAX_AGE
          ? parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10)
          : null,
      },
    }),
  );

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
