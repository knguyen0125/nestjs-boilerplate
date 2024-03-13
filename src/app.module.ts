import { Module, RequestMethod } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { v4 } from 'uuid';
import { HealthModule } from '@/health/health.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NotificationModule } from '@/notification';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      replication: {
        read: process.env.DB_READ_REPLICA_HOST
          ? [
              {
                host: process.env.DB_READ_REPLICA_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
              },
            ]
          : [
              {
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
              },
            ],
        write: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
      },
      autoLoadModels: true,
      // DO NOT use synchronize in production - otherwise you risk data loss
      synchronize: false,
    }),
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
    NotificationModule,
    UserModule,
  ],
})
export class AppModule {}
