import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RabbitmqHealthIndicator } from './rabbitmq-health.indicator';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    TerminusModule,
    // Use the RabbitMQModule configured in the AppModule
    RabbitMQModule.externallyConfigured(RabbitMQModule, 1000),
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, RabbitmqHealthIndicator],
})
export class HealthModule {}
