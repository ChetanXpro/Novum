import { Module } from '@nestjs/common';

import { CommonModule } from './common';
import { VideoModule } from './videos/video.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        CommonModule,
        VideoModule,
        UserModule
    ]
})
export class ApplicationModule {}
