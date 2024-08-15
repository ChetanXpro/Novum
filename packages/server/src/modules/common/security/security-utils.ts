import { FastifyRequest } from 'fastify';
import * as jwt from 'jsonwebtoken';
export function extractTokenPayload(request: FastifyRequest): { email: string, sub: string } | null {

    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return null;
    }
    

    const [, tokenChunk] = header.split(' ');
    if (!tokenChunk) {
        return null;
    }

    try {

        const env = process.env;
        const payload = jwt.verify(tokenChunk, `${env.JWT_SECRET}`);

        if (typeof payload === 'string') {
            return null;
        }

        return payload as { email: string, sub: string };

    }
    catch (err) {
        return null;
    }
}
