import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { registerMiddlewares } from './middlewares';
import { config } from './utils/config';
import { registerRoutes } from './routes';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: false,
    trustProxy: config.server.trustProxy
  });

  await server.register(fastifyCors, {
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400, // 24 hours in seconds
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await registerMiddlewares(server);

  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        description: 'Fastify API with JWT Authentication',
        version: '0.1.0'
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}/api`
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT Bearer token'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  })

  await server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tryItOutEnabled: true
    },
    staticCSP: true
  });

  await registerRoutes(server);

  if (config.environment === 'production') {
    await server.register(fastifyStatic, {
      root: path.join(__dirname, '../../build'),
      prefix: '/'
    });

    server.get('*', (req, reply) => {
      if (req.url.startsWith('/api/')) {
        return reply.callNotFound();
      }
      return reply.sendFile('index.html');
    });
  }

  return server;
}
