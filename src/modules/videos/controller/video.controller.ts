import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { VideoService } from '../service';
import { VideoStatus } from '@prisma/client';

@Controller('videos')
export class VideoController {
    constructor(
        private readonly videoService: VideoService
    ) {}

    @Get('feed')
    async getVideoFeed(@Query('lastVideoId') lastVideoId: string, @Query('limit') limit: number = 1) {
      return this.videoService.getNextVideos(lastVideoId, limit);
    }

    @Post('initiate-upload')
    async initiateUpload(@Body() body: { userId: string; title: string; fileType: string }) {
      return this.videoService.initiateVideoUpload(body.userId, body.title, body.fileType);
    }

    @Post(':id/complete-upload')
    async completeUpload(@Param('id') id: string) {
      return this.videoService.completeVideoUpload(id);
    }
    
    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        return this.videoService.findAll(page, limit);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const video = await this.videoService.findOne(id);
        if (!video) {
            // You might want to throw a NotFoundException here
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        return video;
    }

    @Post()
    async create(@Body() createVideoDto: { userId: string; title: string; s3Key: string }) {
        return this.videoService.create(createVideoDto.userId, createVideoDto.title, createVideoDto.s3Key);
    }

    @Post(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: VideoStatus) {
        const video = await this.videoService.updateStatus(id, status);
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        return video;
    }
}