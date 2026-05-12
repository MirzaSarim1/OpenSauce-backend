import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [FollowsService, PrismaService],
  controllers: [FollowsController],
})
export class FollowsModule {}
