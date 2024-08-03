import { Module } from '@nestjs/common';

import { CommonModule } from './common';
import { VideoModule } from './videos/video.module';
import { UserModule } from './user/user.module';
// import { AuthModule } from './auth/auth.module';
import { PgBossModule } from './common/queue/pg-boss.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        PgBossModule.forRootAsync({
            useFactory: () => ({
                // postgresql://nestjs:password@localhost:5432/nestjs
              connectionString: "postgresql://nestjs:password@localhost:5432/nestjs",
              noTimestampCorrection: true,
              timezone: 'UTC',
              noScheduling: true,
              logLevel: 'debug',
              noSupervisor: true
            }),
          }),
          
        CommonModule,
        VideoModule,
        UserModule,
        AuthModule
    ]
})
export class ApplicationModule {}
