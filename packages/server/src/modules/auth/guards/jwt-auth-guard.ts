import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { extractTokenPayload } from '../../common/security/security-utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const payload = extractTokenPayload(request);

    console.log('payload==', payload);
    
    
    if (!payload) {
      throw new UnauthorizedException();
    }

    (request as any).user = {
      sub: payload.sub,
      email: payload.email,
    };

    return true;
  }
}