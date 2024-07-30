import { Injectable } from '@nestjs/common';

import { Video, VideoStatus, Visibility } from '@prisma/client';
import { PrismaService } from '../../common';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, s3Key: string): Promise<Video> {
    return this.prisma.video.create({
      data: {
        title,
        s3Key,
        status: VideoStatus.PENDING,
        userId,
      },
    });
  }

  async getNextVideos(lastVideoId?: string, limit: number = 1): Promise<Video[]> {
    return this.prisma.video.findMany({
      where: {
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC,
        ...(lastVideoId && {
          id: { gt: lastVideoId }
        })
      },
      orderBy: { id: 'asc' },
      take: limit,
      include: { user: true }
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Video[]> {
    return this.prisma.video.findMany({
      where: { 
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true, tags: true },
    });
  }

  async findOne(id: string): Promise<Video | null> {
    return this.prisma.video.findUnique({
      where: { id },
      include: { user: true, tags: true, comments: true },
    });
  }

  async updateStatus(id: string, status: VideoStatus): Promise<Video> {
    return this.prisma.video.update({
      where: { id },
      data: { status },
    });
  }
}