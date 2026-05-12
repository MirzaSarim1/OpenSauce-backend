import { Controller, Get, Put, Delete, Param, Query, UseGuards, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'read', required: false, type: Boolean, description: 'Filter by read status' })
    async findAll(
        @CurrentUser() user: { id: string },
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('read', new ParseBoolPipe({ optional: true })) read?: boolean,
    ) {
        return this.notificationsService.findAll(user.id, page, limit, read);
    }

    @Get('unread-count')
    async getUnreadCount(@CurrentUser() user: { id: string }) {
        return this.notificationsService.getUnreadCount(user.id);
    }

    @Put(':notificationId/read')
    async markAsRead(
        @Param('notificationId') notificationId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.notificationsService.markAsRead(notificationId, user.id);
    }

    @Put('read-all')
    async markAllAsRead(@CurrentUser() user: { id: string }) {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Delete(':notificationId')
    async delete(
        @Param('notificationId') notificationId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.notificationsService.delete(notificationId, user.id);
    }
}
