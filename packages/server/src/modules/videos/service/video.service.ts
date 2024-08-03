import { Injectable, NotFoundException } from '@nestjs/common';

import { Video, VideoStatus, Visibility } from '@prisma/client';
import { PrismaService } from '../../common';
import { TranscodingService } from './transcoding.service';
import { v4 as uuidv4 } from 'uuid';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoService {
  private s3: S3;
  constructor(private prisma: PrismaService, private transcodingService: TranscodingService, private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      signatureVersion: 'v4',
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async create(userId: string, title: string, s3Key: string): Promise<Video> {
    const video = await this.prisma.video.create({
      data: {
        title,
        s3Key,
        status: VideoStatus.PENDING,
        userId,
      },
    });

    await this.transcodingService.queueVideoForTranscoding(video.id, s3Key);

    return video;
  }

  async getPresignedUrl(key: string, fileType: string): Promise<string> {
    const params = {
      Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
      Key: key,
      ContentType: fileType,
      Expires: 300, // URL expires in 5 minutes
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }



  private generateS3Key(): string {
    return `uploads/${uuidv4()}`;
  }


  async initiateVideoUpload(userId: string, title: string, fileType: string): Promise<{ id: string; uploadUrl: string }> {
    const s3Key = this.generateS3Key();

 
    const video = await this.prisma.video.create({
      data: {
        title,
        status: VideoStatus.PENDING,
        userId,
        s3Key,
      },
    });

    const uploadUrl = await this.getPresignedUrl(s3Key, fileType);

    return { id: video.id, uploadUrl };
  }

  async completeVideoUpload(videoId: string): Promise<Video> {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    try {
      await this.s3.headObject({
        Bucket: this.configService.get<string>('S3_BUCKET_NAME') ?? '',
        Key: video.s3Key,
      }).promise();
    } catch (error) {
      throw new Error('Video file not found in S3');
    }

    await this.transcodingService.queueVideoForTranscoding(video.id, video.s3Key);


    return this.prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PROCESSING },
    });
  }

  private getHlsManifestUrl(hlsManifestKey: string): string {
    return `https://${this.configService.get<string>('S3_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${hlsManifestKey}`;
  }


  async getNextVideos(lastVideoId?: string, limit: number = 1): Promise<Video[]> {
    let whereClause: any = {
      status: VideoStatus.READY,
      visibility: Visibility.PUBLIC,
    };

    if (lastVideoId) {
      const lastVideo = await this.prisma.video.findUnique({
        where: { id: lastVideoId },
        select: { createdAt: true }
      });

      if (lastVideo) {
        whereClause.createdAt = { gt: lastVideo.createdAt };
      }
    }

    const videos = await this.prisma.video.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: +limit,
      include: { user: true }
    });

    const transformedVideos = videos.map(video => ({
      ...video,
      hlsManifestUrl: this.getHlsManifestUrl(video.hlsManifestKey!)
    }));


    return transformedVideos;


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