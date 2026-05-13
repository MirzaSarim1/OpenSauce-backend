import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PusherService } from '../common/services/pusher.service';

@Module({
  providers: [FavoritesService, PrismaService, PusherService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
