import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { registerMiddlewares } from './middlewares';
import { config } from './config';
import { registerRoutes } from './routes';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: false,
    trustProxy: config.server.trustProxy
  });

  await registerMiddlewares(server);

  await server.register(fastifyCors, {
    origin: config.cors.origin,
    methods: config.cors.methods,
    credentials: config.cors.credentials
  });

  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Swagger',
        description: 'Fastify swagger API',
        version: '0.1.0'
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}/api`
        }
      ],
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      }
    }
  })

  await server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // Hook to log requests
  server.addHook('onRequest', async (request) => {
    // logger.debug(`Incoming request: ${request.method} ${request.url}`);
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
