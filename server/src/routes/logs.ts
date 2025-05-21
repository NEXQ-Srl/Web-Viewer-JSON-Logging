import { FastifyInstance } from 'fastify';
import { getLogsHandler } from '../controllers/logsController';

export default async function logRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/logs', {
    schema: {
      tags: ['Logs'],
      summary: 'Retrieve application logs',
      description: 'Returns a list of application logs from the log file',
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
      },
      response: {
        200: {
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
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
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
