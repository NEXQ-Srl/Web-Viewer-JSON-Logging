import { cleanEnv, num, str, bool } from "envalid";

import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath });

const envs = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
    desc: 'The environment in which the application is running'
  }),
  PORT: num({
    default: 5000,
    desc: 'The port on which the server will listen'
  }),
  HOST: str({
    default: '0.0.0.0',
    desc: 'The host on which the server will listen'
  }),
  TRUST_PROXY: bool({
    default: false,
    desc: 'Whether to trust proxy headers'
  }),
  CORS_ORIGIN: str({
    default: 'true', 
    desc: 'CORS allowed origins'
  }),
  CORS_METHODS: str({
    default: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    desc: 'CORS allowed methods'
  }),
  CORS_CREDENTIALS: bool({
    default: true, 
    desc: 'Whether to allow credentials in CORS requests'
  }),
  LOGS_PATH: str({
    default: './logs',
    desc: 'Path where logs will be stored'
  }),
  LOG_LEVEL: str({
    default: 'info',
    choices: ['debug', 'info', 'warn', 'error'],
    desc: 'Logging level'
  }),
  AUTH_ENABLED: bool({
    default: false, 
    desc: 'Whether authentication is enabled'
  }),
  AZURE_TENANT_ID: str({
    default: '',
    desc: 'Azure AD tenant ID'
  }),
  AZURE_SCOPES: str({
    default: 'User.Read',
    desc: 'Azure AD scopes required for authentication'
  })
});

export const config = {
  environment: envs.NODE_ENV,
  server: {
    port: envs.PORT,
    host: envs.HOST,
    trustProxy: envs.TRUST_PROXY
  },
  cors: {
    origin: envs.CORS_ORIGIN === 'true' ? true : envs.CORS_ORIGIN.split(','),
    methods: envs.CORS_METHODS.split(','),
    credentials: envs.CORS_CREDENTIALS
  },
  logs: {
    path: envs.LOGS_PATH,
    level: envs.LOG_LEVEL
  },
  auth: {
    enabled: envs.AUTH_ENABLED,
    tenantId: envs.AZURE_TENANT_ID,
    scopes: envs.AZURE_SCOPES.split(',')
  }
};
