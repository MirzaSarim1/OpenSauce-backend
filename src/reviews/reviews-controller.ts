import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('recipes/:recipeId/reviews')
  async create(
    @Param('recipeId') recipeId: string,
    @CurrentUser() user: { id: string },
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(recipeId, user.id, createReviewDto);
  }

  @Public()
  @Get('recipes/:recipeId/reviews')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'recent' })
  async findByRecipeId(
    @Param('recipeId') recipeId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sortBy') sortBy: string = 'recent',
  ) {
    return this.reviewsService.findByRecipeId(recipeId, page, limit, sortBy);
  }

  @Public()
  @Get('recipes/:recipeId/reviews/user/:userId')
  async findByUserAndRecipe(
    @Param('recipeId') recipeId: string,
    @Param('userId') userId: string,
  ) {
    return this.reviewsService.findByUserAndRecipe(recipeId, userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put('reviews/:reviewId')
  async update(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: { id: string },
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(reviewId, user.id, updateReviewDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:reviewId')
  async delete(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.delete(reviewId, user.id);
  }
}
