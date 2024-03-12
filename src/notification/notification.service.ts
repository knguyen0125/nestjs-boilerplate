import { Injectable } from '@nestjs/common';
import { INotification } from './notification.interface';

@Injectable()
export class NotificationService {
  async send(user: any, notification: INotification) {
    // If notification should queue, send to RabbitMQ
  }
}
