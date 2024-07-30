import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { UserService } from './service';
import { PrismaService } from '../common';


@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}