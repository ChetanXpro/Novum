import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';


import { ApplicationModule } from './modules/app.module';
import { CommonModule, LogInterceptor } from './modules/common';


const API_DEFAULT_PORT = 3000;
const API_DEFAULT_PREFIX = '/api/v1/';


async function bootstrap(): Promise<void> {

    const app = await NestFactory.create<NestFastifyApplication>(
        ApplicationModule,
        new FastifyAdapter()
    );

    // @todo Enable Helmet for better API security headers

    app.setGlobalPrefix(process.env.API_PREFIX || API_DEFAULT_PREFIX);

    const logInterceptor = app.select(CommonModule).get(LogInterceptor);
    app.useGlobalInterceptors(logInterceptor);

    await app.listen(process.env.API_PORT || API_DEFAULT_PORT);
}


bootstrap().catch(err => {

    console.error(err);

    const defaultExitCode = 1;
    process.exit(defaultExitCode);
});
