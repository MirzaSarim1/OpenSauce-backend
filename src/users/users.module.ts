import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CloudinaryService],
})
export class UsersModule {}
