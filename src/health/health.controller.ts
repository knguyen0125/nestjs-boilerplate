import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MikroOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiExcludeController } from '@nestjs/swagger';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RabbitmqHealthIndicator } from './rabbitmq-health.indicator';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mikro: MikroOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private rabbitmq: RabbitmqHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mikro.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
      () => this.rabbitmq.isHealthy('rabbitmq'),
    ]);
  }
}
