import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { VideoService } from '../service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
import { GetUser } from '../../common/decorators';
import { AuthGuard } from '@nestjs/passport';

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
    @UseGuards(JwtAuthGuard)
    async initiateUpload(@Body() body: { userId: string; title: string; fileType: string }) {
      return this.videoService.initiateVideoUpload(body.userId, body.title, body.fileType);
    }

    @Post(':id/complete-upload')
    @UseGuards(JwtAuthGuard)
    async completeUpload(@Param('id') id: string) {
      return this.videoService.completeVideoUpload(id);
    }
    
    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        return this.videoService.findAll(page, limit);
    }

    // @Get(':id')
    // async findOne(@Param('id') id: string) {
    //     const video = await this.videoService.findOne(id);
    //     if (!video) {
    //         // You might want to throw a NotFoundException here
    //         throw new NotFoundException(`Video with ID ${id} not found`);
    //     }
    //     return video;
    // }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
  async toggleLike(@GetUser() user: any, @Param('id') videoId: string) {
    await this.videoService.toggleLike(user.sub, videoId);
    return { message: 'Like toggled successfully' };
  }

  @Post(':id/comment')
  @UseGuards(AuthGuard('jwt'))
  async addComment(@GetUser() user: any, @Param('id') videoId: string, @Body('content') content: string) {
    return this.videoService.addComment(user.sub, videoId, content);
  }

  @Get(':id/comments')
  async getComments(@Param('id') videoId: string, @Query('page') page: number, @Query('pageSize') pageSize: number) {
    return this.videoService.getComments(videoId, page, pageSize);
  }

  @Get(':id')
  async getVideoDetails(@Param('id') videoId: string, @GetUser() user: any) {
    const video = await this.videoService.getVideoDetails(videoId);
    if (user) {
      (video as any).isLikedByUser = await this.videoService.isLikedByUser(user.sub, videoId);
    }
    return video;
  }

  @Post(':id/view')
  async incrementViews(@Param('id') videoId: string) {
    await this.videoService.incrementViews(videoId);
    return { message: 'View count incremented' };
  }




}