import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PusherService } from '../common/services/pusher.service';

@Module({
  providers: [FollowsService, PrismaService, PusherService],
  controllers: [FollowsController],
})
export class FollowsModule {}
