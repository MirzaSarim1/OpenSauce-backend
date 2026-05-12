import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prismaService: PrismaService) {}

  async create(
    recipeId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const existingReview = await this.prismaService.review.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this recipe');
    }

    const review = await this.prismaService.review.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment || null,
        userId,
        recipeId,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    await this.recalculateAverageRating(recipeId);

    if (recipe.authorId !== userId) {
      await this.prismaService.notification.create({
        data: {
          userId: recipe.authorId,
          type: 'REVIEW',
          title: 'New Review on Your Recipe',
          message: `${review.user.name} left a ${review.rating}-star review on your recipe`,
          data: {
            recipeId,
            reviewId: review.id,
            reviewerId: userId,
            rating: review.rating,
          },
        },
      });
    }

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userId: review.userId,
      recipeId: review.recipeId,
      user: review.user,
      createdAt: review.createdAt,
    };
  }

  async findByRecipeId(
    recipeId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'recent',
  ) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
      select: { averageRating: true, _count: { select: { reviews: true } } },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (sortBy === 'helpful') {
      orderBy.rating = 'desc';
    } else if (sortBy === 'highest-rated') {
      orderBy.rating = 'desc';
    } else if (sortBy === 'lowest-rated') {
      orderBy.rating = 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const reviews = await this.prismaService.review.findMany({
      where: { recipeId },
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return {
      data: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: review.user,
        createdAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total: recipe._count.reviews,
      },
      averageRating: recipe.averageRating,
      totalReviews: recipe._count.reviews,
    };
  }

  async findByUserAndRecipe(recipeId: string, userId: string) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const review = await this.prismaService.review.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!review) {
      return { review: null };
    }

    return {
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    };
  }

  async update(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Only review author can update');
    }

    const updated = await this.prismaService.review.update({
      where: { id: reviewId },
      data: {
        ...(updateReviewDto.rating !== undefined && { rating: updateReviewDto.rating }),
        ...(updateReviewDto.comment !== undefined && { comment: updateReviewDto.comment }),
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        recipeId: true,
      },
    });

    await this.recalculateAverageRating(updated.recipeId);

    return updated;
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Only review author can delete');
    }

    const recipeId = review.recipeId;

    await this.prismaService.review.delete({
      where: { id: reviewId },
    });

    await this.recalculateAverageRating(recipeId);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  private async recalculateAverageRating(recipeId: string) {
    const reviews = await this.prismaService.review.findMany({
      where: { recipeId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    await this.prismaService.recipe.update({
      where: { id: recipeId },
      data: { averageRating },
    });
  }
}
