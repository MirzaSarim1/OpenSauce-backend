import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Public()
  @Get(':userId')
  @ApiQuery({
    name: 'includeFeed',
    required: false,
    type: Boolean,
    description: 'Include recent recipes and stats',
  })
  async getPublicProfile(
    @Param('userId') userId: string,
    @Query('includeFeed') includeFeed?: string,
  ) {
    return this.usersService.getPublicProfile(
      userId,
      includeFeed === 'true',
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: { buffer: Buffer; originalname: string },
  ) {
    const updated = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
      file,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    };
  }

  @Public()
  @Get(':userId/followers')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.usersService.getFollowers(userId, page, limit);
  }

  @Public()
  @Get(':userId/following')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.usersService.getFollowing(userId, page, limit);
  }
}
