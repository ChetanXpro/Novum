import { Module, DynamicModule, Global, Logger } from '@nestjs/common';
import * as PgBoss from 'pg-boss';

export const PG_BOSS = 'PG_BOSS';

@Global()
@Module({})
export class PgBossModule {
  private static readonly logger = new Logger(PgBossModule.name);

  static forRootAsync(options: { useFactory: (...args: any[]) => PgBoss.ConstructorOptions }): DynamicModule {
    return {
      module: PgBossModule,
      providers: [
        {
          provide: PG_BOSS,
          useFactory: async (...args: any[]) => {
            const config = options.useFactory(...args);
        

            try {
              const boss = new PgBoss(config);

              boss.on('error', error => this.logger.error('PgBoss error:', error));

              await boss.start();
              this.logger.log('PgBoss started successfully');
              return boss;
            } catch (error) {
              this.logger.error('Failed to start PgBoss:', error);
              throw error;
            }
          },
        },
      ],
      exports: [PG_BOSS],
    };
  }

}