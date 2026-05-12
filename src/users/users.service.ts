import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface RecentRecipe {
  id: string;
  title: string;
  image: string | null;
  averageRating: number;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPublicProfile(userId: string, includeFeed: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const recipesCount = await this.prisma.recipe.count({
      where: { authorId: userId },
    });

    const followersCount = await this.prisma.follow.count({
      where: { followingId: userId },
    });

    const followingCount = await this.prisma.follow.count({
      where: { followerId: userId },
    });

    let recentRecipes: RecentRecipe[] = [];
    if (includeFeed) {
      recentRecipes = await this.prisma.recipe.findMany({
        where: { authorId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          image: true,
          averageRating: true,
        },
      });
    }

    return {
      ...user,
      recipesCount,
      followersCount,
      followingCount,
      recentRecipes,
    };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    file?: { buffer: Buffer; originalname: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (updateProfileDto.name) {
      updateData.name = updateProfileDto.name;
    }

    if (updateProfileDto.bio) {
      updateData.bio = updateProfileDto.bio;
    }

    if (updateProfileDto.removeImage && user.imagePublicId) {
      await this.cloudinary.deleteImage(user.imagePublicId);
      updateData.image = null;
      updateData.imagePublicId = null;
    }

    if (file) {
      if (user.imagePublicId) {
        await this.cloudinary.deleteImage(user.imagePublicId);
      }

      const { url, publicId } = await this.cloudinary.uploadImage(
        file,
        'open-sauce/profiles',
      );
      updateData.image = url;
      updateData.imagePublicId = publicId;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      skip,
      take: limit,
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    const total = await this.prisma.follow.count({
      where: { followingId: userId },
    });

    return {
      data: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      skip,
      take: limit,
      select: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    const total = await this.prisma.follow.count({
      where: { followerId: userId },
    });

    return {
      data: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
