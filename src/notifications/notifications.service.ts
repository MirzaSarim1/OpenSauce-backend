import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PusherService } from '../common/services/pusher.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prismaService: PrismaService,
    private pusherService: PusherService,
  ) {}

  async findAll(userId: string, page: number = 1, limit: number = 10, read?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (read !== undefined) {
      where.read = read;
    }

    const [notifications, total] = await Promise.all([
      this.prismaService.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prismaService.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Cannot access notification');
    }

    await this.prismaService.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    await this.pusherService.triggerNotificationRead(userId, notificationId);

    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(userId: string) {
    await this.prismaService.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    await this.pusherService.triggerNotificationRead(userId, 'all');

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  async delete(notificationId: string, userId: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Cannot delete notification');
    }

    await this.prismaService.notification.delete({
      where: { id: notificationId },
    });

    await this.pusherService.triggerNotificationDelete(userId, notificationId);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }
}
