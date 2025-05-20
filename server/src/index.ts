import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { createServer } from './server';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start(): Promise<void> {
  const server = await createServer();
  
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Swagger documentation available at: http://localhost:${PORT}/documentation`);

    const shutdown = async () => {
      logger.info('Shutting down server...');
      await server.close();
      logger.info('Server shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
