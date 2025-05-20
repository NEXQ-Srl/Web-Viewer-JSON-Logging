import { FastifyInstance } from 'fastify';
import logRoutes from './logs';

export async function registerRoutes(server: FastifyInstance) {
  // Prefix all API routes
  server.register(logRoutes, { prefix: '/api' });
  
  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
