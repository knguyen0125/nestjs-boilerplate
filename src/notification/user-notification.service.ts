import { Injectable } from '@nestjs/common';
import { IUserNotification } from './notification.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class UserNotificationService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async send(notification: IUserNotification) {
    await this.amqpConnection.publish(
      'default',
      'notification',
      JSON.stringify(notification),
    );
  }
}
