import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow('PUSHER_APP_ID'),
      key: this.configService.getOrThrow('PUSHER_APP_KEY'),
      secret: this.configService.getOrThrow('PUSHER_APP_SECRET'),
      cluster: this.configService.getOrThrow('PUSHER_APP_CLUSTER'),
    });
  }

  async triggerNewNotification(userId: string, notification: any) {
    await this.pusher.trigger(`user-${userId}`, 'new-notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }

  async triggerNotificationRead(userId: string, notificationId: string) {
    await this.pusher.trigger(`user-${userId}`, 'notification-read', {
      notificationId,
      read: true,
    });
  }

  async triggerNotificationDelete(userId: string, notificationId: string) {
    await this.pusher.trigger(`user-${userId}`, 'notification-deleted', {
      notificationId,
    });
  }
}
