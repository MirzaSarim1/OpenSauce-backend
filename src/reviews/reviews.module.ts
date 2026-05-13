import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews-controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PusherService } from '../common/services/pusher.service';

@Module({
  providers: [ReviewsService, PrismaService, PusherService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
