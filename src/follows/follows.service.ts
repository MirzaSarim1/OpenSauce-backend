import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FollowsService {
    constructor(private prismaService: PrismaService) { }

    async toggle(targetUserId: string, userId: string) {
        if (targetUserId === userId) {
            throw new BadRequestException('Cannot follow yourself');
        }

        const targetUser = await this.prismaService.user.findUnique({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        const existing = await this.prismaService.follow.findUnique({
            where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
        });

        if (existing) {
            await this.prismaService.follow.delete({
                where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
            });

            return {
                success: true,
                isFollowing: false,
                message: 'Unfollowed user',
            };
        }

        await this.prismaService.follow.create({
            data: {
                followerId: userId,
                followingId: targetUserId,
            },
        });

        await this.prismaService.notification.create({
            data: {
                userId: targetUserId,
                type: 'FOLLOW',
                title: 'New Follower',
                message: 'Someone started following you',
                data: {
                    followerId: userId,
                },
            },
        });

        return {
            success: true,
            isFollowing: true,
            message: 'Now following user',
        };
    }

    async checkIfFollowing(targetUserId: string, userId: string) {
        const targetUser = await this.prismaService.user.findUnique({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (targetUserId === userId) {
            return { isFollowing: false };
        }

        const follow = await this.prismaService.follow.findUnique({
            where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
        });

        return { isFollowing: !!follow };
    }
}
