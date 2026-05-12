import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews-controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [ReviewsService, PrismaService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
