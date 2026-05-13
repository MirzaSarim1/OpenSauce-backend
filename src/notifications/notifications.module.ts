import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PusherService } from '../common/services/pusher.service';

@Module({
  providers: [NotificationsService, PrismaService, PusherService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
