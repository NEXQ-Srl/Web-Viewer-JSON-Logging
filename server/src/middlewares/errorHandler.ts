import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  logger.error(`Error occurred: ${error.message}`, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    }
  });

  // Handle specific error types
  if (error.statusCode === 404) {
    return reply.code(404).send({
      error: 'Not Found',
      message: 'The requested resource could not be found',
      statusCode: 404
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : error.message;
    
  reply.code(statusCode).send({
    error: error.name || 'Error',
    message,
    statusCode
  });
}
