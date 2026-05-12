import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    userId: string,
    createRecipeDto: CreateRecipeDto,
    file?: { buffer: Buffer; originalname: string },
  ) {
    const ingredients = JSON.parse(createRecipeDto.ingredients);
    
    const categories = createRecipeDto.categories
      ?.split(',')
      .map((c) => c.trim())
      .filter((c) => c) || [];
    
    const tags = createRecipeDto.tags
      ?.split(',')
      .map((t) => t.trim())
      .filter((t) => t) || [];

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(
        file,
        'open-sauce/recipes',
      );
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const recipe = await this.prismaService.recipe.create({
      data: {
        title: createRecipeDto.title,
        description: createRecipeDto.description,
        instructions: createRecipeDto.instructions,
        prepTime: createRecipeDto.prepTime,
        cookTime: createRecipeDto.cookTime,
        difficulty: createRecipeDto.difficulty,
        cuisine: createRecipeDto.cuisine,
        image: imageUrl,
        imagePublicId,
        authorId: userId,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            ingredient: {
              connectOrCreate: {
                where: { name: ing.name.toLowerCase() },
                create: { name: ing.name.toLowerCase() },
              },
            },
            quantity: ing.quantity,
            unit: ing.unit || null,
          })),
        },
        categories: {
          connectOrCreate: categories.map((cat) => ({
            where: { name: cat },
            create: { name: cat },
          })),
        },
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag, type: 'GENERIC' },
          })),
        },
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
        categories: true,
        tags: true,
      },
    });

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      image: recipe.image,
      authorId: recipe.authorId,
      averageRating: recipe.averageRating,
      createdAt: recipe.createdAt,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
      categories: recipe.categories.map((c) => c.name),
      tags: recipe.tags.map((t) => t.name),
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 12,
    difficulty?: string,
    cuisine?: string,
    category?: string,
    tag?: string,
    search?: string,
    sortBy: string = 'recent',
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (difficulty) where.difficulty = difficulty;
    if (cuisine) where.cuisine = cuisine;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          ingredients: {
            some: {
              ingredient: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }
    if (category) {
      where.categories = {
        some: { name: category },
      };
    }
    if (tag) {
      where.tags = {
        some: { name: tag },
      };
    }

    const orderBy: any = {};
    if (sortBy === 'popular') {
      orderBy.favorites = { _count: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy.averageRating = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [recipes, total] = await Promise.all([
      this.prismaService.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { reviews: true, favorites: true },
          },
        },
      }),
      this.prismaService.recipe.count({ where }),
    ]);

    return {
      data: recipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        image: recipe.image,
        averageRating: recipe.averageRating,
        author: recipe.author,
        reviewCount: recipe._count.reviews,
        favoritesCount: recipe._count.favorites,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        ingredients: {
          include: { ingredient: true },
        },
        categories: true,
        tags: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { favorites: true, reviews: true },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      image: recipe.image,
      averageRating: recipe.averageRating,
      author: recipe.author,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
      categories: recipe.categories.map((c) => c.name),
      tags: recipe.tags.map((t) => t.name),
      reviews: recipe.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        user: r.user,
        createdAt: r.createdAt,
      })),
      favoritesCount: recipe._count.favorites,
      reviewsCount: recipe._count.reviews,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async update(
    id: string,
    userId: string,
    updateRecipeDto: UpdateRecipeDto,
    file?: { buffer: Buffer; originalname: string },
  ) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('Only recipe author can update');
    }

    let imageUrl = recipe.image;
    let imagePublicId = recipe.imagePublicId;

    if (file) {
      if (recipe.imagePublicId) {
        await this.cloudinaryService.deleteImage(recipe.imagePublicId);
      }
      const uploaded = await this.cloudinaryService.uploadImage(
        file,
        'open-sauce/recipes',
      );
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    const categories = updateRecipeDto.categories
      ?.split(',')
      .map((c) => c.trim())
      .filter((c) => c);
    
    const tags = updateRecipeDto.tags
      ?.split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    let ingredients;
    if (updateRecipeDto.ingredients) {
      ingredients = JSON.parse(updateRecipeDto.ingredients);
      await this.prismaService.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });
    }

    const updated = await this.prismaService.recipe.update({
      where: { id },
      data: {
        ...(updateRecipeDto.title && { title: updateRecipeDto.title }),
        ...(updateRecipeDto.description && { description: updateRecipeDto.description }),
        ...(updateRecipeDto.instructions && { instructions: updateRecipeDto.instructions }),
        ...(updateRecipeDto.prepTime && { prepTime: updateRecipeDto.prepTime }),
        ...(updateRecipeDto.cookTime && { cookTime: updateRecipeDto.cookTime }),
        ...(updateRecipeDto.difficulty && { difficulty: updateRecipeDto.difficulty }),
        ...(updateRecipeDto.cuisine && { cuisine: updateRecipeDto.cuisine }),
        ...(imageUrl && { image: imageUrl }),
        ...(imagePublicId && { imagePublicId }),
        ...(ingredients && {
          ingredients: {
            create: ingredients.map((ing: any) => ({
              ingredient: {
                connectOrCreate: {
                  where: { name: ing.name.toLowerCase() },
                  create: { name: ing.name.toLowerCase() },
                },
              },
              quantity: ing.quantity,
              unit: ing.unit || null,
            })),
          },
        }),
        ...(categories && {
          categories: {
            set: [],
            connectOrCreate: categories.map((cat) => ({
              where: { name: cat },
              create: { name: cat },
            })),
          },
        }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag, type: 'GENERIC' },
            })),
          },
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId && recipe.author.role !== 'ADMIN') {
      throw new ForbiddenException('Only recipe author or admin can delete');
    }

    if (recipe.imagePublicId) {
      await this.cloudinaryService.deleteImage(recipe.imagePublicId);
    }

    await this.prismaService.recipe.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Recipe deleted successfully',
    };
  }
}
