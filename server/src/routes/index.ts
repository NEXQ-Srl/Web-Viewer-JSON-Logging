import { FastifyInstance } from 'fastify';
import logRoutes from './logs';
import { logger } from '../utils/logger';

const securitySchema = {
  security: [{ bearerAuth: [] }],
  headers: {
    type: 'object',
    properties: {
      authorization: {
        type: 'string',
        description: 'Bearer token for authentication'
      }
    },
    required: ['authorization']
  }
};

export async function registerRoutes(server: FastifyInstance) {
  server.register(async (apiRouter) => {
    logger.info('Registering API routes under /api prefix');

    apiRouter.addHook('onRoute', (routeOptions) => {
      if (!routeOptions.schema) {
        routeOptions.schema = {};
      }
      
      if (!routeOptions.schema.security) {
        routeOptions.schema.security = securitySchema.security;
      }
      
      if (!routeOptions.schema.headers) {
        routeOptions.schema.headers = securitySchema.headers;
      }
    });

    await apiRouter.register(logRoutes);

    apiRouter.get('/health', {
      schema: {
        security: [{ bearerAuth: [] }],
        headers: securitySchema.headers,
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
      handler: async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
      }
    });
  }, { prefix: '/api' });
}
