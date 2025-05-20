import { FastifyInstance } from 'fastify';
import { requestLogger } from './requestLogger';
import { errorHandler } from './errorHandler';
export async function registerMiddlewares(server: FastifyInstance) {
  server.addHook('onRequest', requestLogger);
  
  server.setErrorHandler(errorHandler);
}
