import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitmqHealthIndicator extends HealthIndicator {
  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
  }

  async isHealthy(key: string) {
    if (this.amqpConnection.connected) {
      return this.getStatus(key, true);
    }

    throw new HealthCheckError(
      'RabbitMQ check failed',
      this.getStatus(key, false),
    );
  }
}
