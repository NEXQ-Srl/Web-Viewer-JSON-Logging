import { FastifyInstance } from 'fastify';
import { getLogsHandler } from '../controllers/logsController';

export default async function logRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/logs', {
    schema: {
      tags: ['Logs'],
      summary: 'Retrieve application logs',
      description: 'Returns a list of application logs from the log file with pagination and filtering',
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
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Items per page' },
          level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'], description: 'Filter by log level' },
          search: { type: 'string', description: 'Search in message and correlationId fields' },
          startDate: { type: 'string', format: 'date-time', description: 'Filter logs after this date' },
          endDate: { type: 'string', format: 'date-time', description: 'Filter logs before this date' },
          correlationId: { type: 'string', description: 'Filter by correlation ID' },
          module: { type: 'string', description: 'Filter by module name' },
          context: { type: 'string', description: 'Filter by context' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
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
            }, pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }, audit: {
              type: 'object',
              properties: {
                byHour: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      hour: { type: 'string' },
                      info: { type: 'integer' },
                      error: { type: 'integer' },
                      warn: { type: 'integer' },
                      debug: { type: 'integer' },
                      total: { type: 'integer' }
                    }
                  }
                },
                byDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      info: { type: 'integer' },
                      error: { type: 'integer' },
                      warn: { type: 'integer' },
                      debug: { type: 'integer' },
                      total: { type: 'integer' }
                    }
                  }
                },
                totalCounts: {
                  type: 'object',
                  properties: {
                    info: { type: 'integer' },
                    error: { type: 'integer' },
                    warn: { type: 'integer' },
                    debug: { type: 'integer' },
                    total: { type: 'integer' }
                  }
                }
              }
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
