import { Module } from '@nestjs/common';
import { VideoController } from './controller';
import { TranscodingService, VideoService } from './service';
import { CommonModule, PrismaService } from '../common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports:[CommonModule],
  controllers: [VideoController],
  providers: [VideoService,PrismaService,TranscodingService,ConfigService],
})
export class VideoModule {}