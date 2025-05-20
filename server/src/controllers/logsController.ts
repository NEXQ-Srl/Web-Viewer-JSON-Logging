import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import { logger } from '../utils/logger';
import { getLogFilePath, parseLogData } from '../services/logService';

export async function getLogsHandler(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const logFilePath = getLogFilePath();
    
    try {
      await fs.access(logFilePath);
    } catch (err) {
      logger.error(`Log file not found: ${logFilePath}`);
      return reply.status(404).send({ 
        error: 'Log file not found',
        message: 'The configured log file does not exist'
      });
    }
    
    const logContent = await fs.readFile(logFilePath, 'utf-8');
    const logs = parseLogData(logContent);
    
    logger.info(`Successfully read ${logs.length} log entries`);
    return reply.send(logs);
    
  } catch (error) {
    logger.error('Error reading log file', error);
    return reply.status(500).send({ 
      error: 'Internal Server Error',
      message: 'Failed to read log data' 
    });
  }
}
