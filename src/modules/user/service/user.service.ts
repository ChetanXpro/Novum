import { Injectable } from '@nestjs/common';
import { User, Video, Prisma } from '@prisma/client';
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
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { googleId },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
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

    async createPasswordResetToken(userId: string): Promise<string> {
        const token = Math.random().toString(36).substr(2, 15);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        await this.prisma.passwordReset.upsert({
            where: { userId },
            update: { token, expiresAt },
            create: { userId, token, expiresAt },
        });

        return token;
    }

    async verifyPasswordResetToken(token: string): Promise<User | null> {
        const resetRecord = await this.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            return null;
        }

        return resetRecord.user;
    }

    async createEmailVerificationToken(userId: string): Promise<string> {
        const token = Math.random().toString(36).substr(2, 15); 
        const expiresAt = new Date(Date.now() + 86400000); // 24 hours from now

        await this.prisma.emailVerification.upsert({
            where: { userId },
            update: { token, expiresAt },
            create: { userId, token, expiresAt },
        });

        return token;
    }

    async verifyEmailToken(token: string): Promise<User | null> {
        const verificationRecord = await this.prisma.emailVerification.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
            return null;
        }

        await this.prisma.user.update({
            where: { id: verificationRecord.userId },
            data: { isEmailVerified: true },
        });

        await this.prisma.emailVerification.delete({
            where: { id: verificationRecord.id },
        });

        return verificationRecord.user;
    }
}