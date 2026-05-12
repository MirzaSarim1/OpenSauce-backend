import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Follows')
@Controller()
export class FollowsController {
    constructor(private followsService: FollowsService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('users/:targetUserId/follow')
    async toggle(
        @Param('targetUserId') targetUserId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.followsService.toggle(targetUserId, user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('users/:targetUserId/follow/check')
    async checkIfFollowing(
        @Param('targetUserId') targetUserId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.followsService.checkIfFollowing(targetUserId, user.id);
    }
}
