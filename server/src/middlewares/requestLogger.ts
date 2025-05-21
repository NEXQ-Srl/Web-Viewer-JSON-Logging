import { FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';

export async function requestLogger(request: FastifyRequest) {
  try {
    const safeHeaders = { ...request.headers };
    if (safeHeaders.authorization) {
      safeHeaders.authorization = '[REDACTED]';
    }
    
    const params = request.params || {};
    const query = request.query || {};
    
    logger.debug(`Incoming request: ${request.method} ${request.url}`, {
      method: request.method,
      url: request.url,
      params,
      query,
      headers: safeHeaders,
      ip: request.ip
    });
  } catch (error) {
    logger.error('Error in request logger middleware', error);
  }
}
