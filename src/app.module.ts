import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { v4 } from 'uuid';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HealthModule } from './health/health.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    // Configuration for the MikroORM module in mikro-orm.config.ts
    MikroOrmModule.forRoot(),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
      options: {
        // Fail fast if the Redis server is down
        enableOfflineQueue: false,
        // Prevent the app from hanging indefinitely if the Redis server is down
        commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 5000,
        disconnectTimeout:
          parseInt(process.env.REDIS_DISCONNECT_TIMEOUT) || 1000,
      },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        // Create a default topic exchange
        { name: 'default', type: 'topic' },
      ],
      uri: process.env.RABBITMQ_URL,
      connectionInitOptions: { wait: false },
      // Only register handlers in worker mode
      registerHandlers: process.env.WORKER_MODE === 'true',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: function (req, res) {
          const existingID = req.id ?? req.headers['x-request-id'];
          if (existingID) return existingID;
          const id = v4();
          res.setHeader('X-Request-Id', id);
          return id;
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
        },
      },
      exclude: [
        // Ignore health check requests
        { method: RequestMethod.ALL, path: 'health' },
      ],
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
