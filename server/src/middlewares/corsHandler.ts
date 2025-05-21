import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export async function corsHandler(request: FastifyRequest, reply: FastifyReply) {
  if (request.method === 'OPTIONS') {
    logger.debug('Handling CORS preflight request');
    
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Max-Age', '86400');
    
    reply.code(204).send();
    return;
  }
}
