import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';


import { ApplicationModule } from './modules/app.module';
import { CommonModule, LogInterceptor } from './modules/common';
import { Logger } from 'winston';


const API_DEFAULT_PORT = 3001;
const API_DEFAULT_PREFIX = '/api/v1/';


async function bootstrap(): Promise<void> {

  const logger = new Logger();

  const app = await NestFactory.create<NestFastifyApplication>(
    ApplicationModule,
    new FastifyAdapter()
  );

  const fastifyInstance = app.getHttpAdapter().getInstance();



  // This is a workaround to fix the issue with passportjs and fastify compatibility
  // Ref: https://github.com/nestjs/nest/issues/5702#issuecomment-979893525

  fastifyInstance.addHook('onRequest', (request: any, reply: any, done: any) => {
    reply.setHeader = function (key: any, value: any) {
      return this.raw.setHeader(key, value)
    }
    reply.end = function () {
      this.raw.end()
    }
    request.res = reply
    done()
  })



  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:3000'];
      const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || origin.endsWith('.localhost:3000');

      if (isAllowedOrigin) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET, PUT, POST, DELETE'],
    credentials: true,
  });

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
