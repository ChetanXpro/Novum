import { Injectable } from '@nestjs/common';

import { User, Video } from '@prisma/client';
import { PrismaService } from '../../common';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
        return this.prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async findOne(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async create(username: string, email: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                username,
                email,
            },
        });
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async getUserVideos(userId: string, page: number = 1, limit: number = 10): Promise<Video[] | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                videos: {
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return user ? user.videos : null;
    }
}