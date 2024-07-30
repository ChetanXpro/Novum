import { Module } from '@nestjs/common';
import { VideoController } from './controller';
import { VideoService } from './service';
import { CommonModule } from '../common';

@Module({
  imports:[CommonModule],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}