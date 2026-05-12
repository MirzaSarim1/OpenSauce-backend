import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private prismaService: PrismaService) { }

    async toggle(recipeId: string, userId: string) {
        const recipe = await this.prismaService.recipe.findUnique({
            where: { id: recipeId },
            select: { authorId: true },
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        const existing = await this.prismaService.favorite.findUnique({
            where: { userId_recipeId: { userId, recipeId } },
        });

        if (existing) {
            await this.prismaService.favorite.delete({
                where: { userId_recipeId: { userId, recipeId } },
            });

            return {
                success: true,
                isFavorited: false,
                message: 'Reci[e removed from favorites'
            };
        }

        await this.prismaService.favorite.create({
            data: { userId, recipeId },
        });

        if (recipe.authorId !== userId) {
            await this.prismaService.notification.create({
                data: {
                    userId: recipe.authorId,
                    type: 'FAVORITE',
                    title: 'Recipe Favorited',
                    message: 'Someone favorited your recipe',
                    data: {
                        recipeId,
                        userId,
                    },
                },
            });
        }

        return {
            success: true,
            isFavorited: true,
            message: 'Recipe added to favorites',
        };
    }

    async findUserFavorites(userId: string, page: number = 1, limit: number = 12) {
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            this.prismaService.favorite.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { assignedAt: 'desc' },
                include: {
                    recipe: {
                        include: {
                            author: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            }),
            this.prismaService.favorite.count({ where: { userId } }),
        ]);

        return {
            data: favorites.map((fav) => ({
                id: fav.recipe.id,
                title: fav.recipe.title,
                image: fav.recipe.image,
                averageRating: fav.recipe.averageRating,
                author: fav.recipe.author,
                favoritedAt: fav.assignedAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async checkIfFavorited(recipeId: string, userId: string) {
        const favorite = await this.prismaService.favorite.findUnique({
            where: { userId_recipeId: { userId, recipeId } },
        });

        return {
            isFavorited: !!favorite,
        };
    }

    async getCount(recipeId: string) {
        const recipe = await this.prismaService.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        const count = await this.prismaService.favorite.count({
            where: { recipeId },
        });

        return {
            count,
        };
    }
}
