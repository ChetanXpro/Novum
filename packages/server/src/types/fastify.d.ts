import { FastifyRequest as OriginalFastifyRequest } from 'fastify'
import { Role } from '../modules/tokens'

declare module 'fastify' {
  interface FastifyRequest extends OriginalFastifyRequest {
    user?: {
      id: string;
      role: Role;
    }
  }
}