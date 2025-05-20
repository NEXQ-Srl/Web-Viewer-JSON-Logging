export const config = {
  environment: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: process.env.TRUST_PROXY === 'true'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    methods: process.env.CORS_METHODS || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  logs: {
    path: process.env.LOGS_PATH || './logs',
    level: process.env.LOG_LEVEL || 'info'
  }
};
