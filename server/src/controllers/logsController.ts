import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { getFilteredLogs } from '../services/logService';
import { LogFilterQuery } from '../types/request';

export async function getLogsHandler(
  request: FastifyRequest<{ Querystring: LogFilterQuery }>,
  reply: FastifyReply
) {
  try {
    const queryParams = request.query;
    const page = parseInt(String(queryParams.page || '1'), 10);
    const limit = parseInt(String(queryParams.limit || '20'), 10);

    logger.debug(`Fetching logs with filters: ${JSON.stringify(queryParams)}`);
    try {
      const { logs, total, audit } = await getFilteredLogs({
        ...queryParams,
        page,
        limit
      });

      const totalPages = Math.ceil(total / limit);

      logger.debug(`Successfully retrieved ${logs.length} log entries (page ${page}/${totalPages})`);

      return reply.send({
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        audit
      });

    } catch (err: any) {
      if (err.code === 'ENOENT') {
        logger.error(`Log file not found: ${err.message}`);
        return reply.status(404).send({
          error: 'Log file not found',
          message: 'The configured log file does not exist'
        });
      }
      throw err;
    }

  } catch (error) {
    logger.error('Error processing logs request', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to retrieve log data'
    });
  }
}
