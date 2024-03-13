import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';

@Module({
  providers: [UserNotificationService],
  exports: [UserNotificationService],
})
export class NotificationModule {}
