import { FastifyInstance } from 'fastify';
import { getLogsHandler } from '../controllers/logsController';

export default async function logRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/logs', {
    schema: {
      tags: ['logs'],
      summary: 'Get all logs',
      description: 'Retrieves all logs from the configured log file',
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              '@timestamp': { type: 'string', format: 'date-time' },
              level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'] },
              message: { type: 'string' },
              correlationId: { type: 'string', nullable: true },
              module: { type: 'string', nullable: true },
              context: { type: 'string', nullable: true }
            }
          }
        },
        404: {
          description: 'Log file not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: getLogsHandler
  });
}
