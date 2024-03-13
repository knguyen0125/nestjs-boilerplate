import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [RabbitMQModule.externallyConfigured(RabbitMQModule, 1000)],
  providers: [UserNotificationService],
  exports: [UserNotificationService],
})
export class NotificationModule {}
