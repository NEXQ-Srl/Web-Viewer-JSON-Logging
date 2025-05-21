import { FastifyInstance } from 'fastify';
import { requestLogger } from './requestLogger';
import { errorHandler } from './errorHandler';
import { authMiddleware } from './authMiddleware';
import { corsHandler } from './corsHandler';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

export async function registerMiddlewares(server: FastifyInstance) {
  server.addHook('onRequest', corsHandler);
  server.addHook('onRequest', requestLogger);
  
  logger.info(`Auth configuration: enabled=${config.auth.enabled}, tenantId=${config.auth.tenantId ? '(set)' : '(not set)'}`);
  
  server.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      logger.debug(`Applying auth middleware to ${request.method} ${request.url}`);
      if (request.method === 'OPTIONS') {
        return;
      }
      
      if (request.url.startsWith('/documentation') || 
          request.url.startsWith('/swagger')) {
        logger.debug('Skipping auth for swagger documentation');
        return;
      }
      
      if (config.auth.enabled) {
        await authMiddleware(request, reply);
      } else {
        logger.debug('Authentication is disabled - skipping auth check');
      }
    }
  });
  
  server.setErrorHandler(errorHandler);
}
