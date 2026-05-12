import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  providers: [RecipesService, PrismaService, CloudinaryService],
  controllers: [RecipesController],
})
export class RecipesModule {}
