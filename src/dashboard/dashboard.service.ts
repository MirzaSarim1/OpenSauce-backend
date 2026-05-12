import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prismaService: PrismaService) {}

  async getDashboard(userId: string) {
    const [recipesCount, favoritesCount, reviewsCount, favoritedRecipesCount, recentRecipes] =
      await Promise.all([
        this.prismaService.recipe.count({
          where: { authorId: userId },
        }),
        this.prismaService.favorite.count({
          where: { recipe: { authorId: userId } },
        }),
        this.prismaService.review.count({
          where: { recipe: { authorId: userId } },
        }),
        this.prismaService.favorite.count({
          where: { userId },
        }),
        this.prismaService.recipe.findMany({
          where: { authorId: userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { favorites: true, reviews: true },
            },
          },
        }),
      ]);

    return {
      recipesCount,
      totalFavorites: favoritesCount,
      totalReviews: reviewsCount,
      favoritedRecipesCount,
      recentRecipes: recentRecipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        createdAt: recipe.createdAt,
        favoritesCount: recipe._count.favorites,
        reviewsCount: recipe._count.reviews,
      })),
    };
  }
}
