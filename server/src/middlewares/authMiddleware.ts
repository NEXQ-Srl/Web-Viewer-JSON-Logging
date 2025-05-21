import { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends FastifyRequest {
    user?: any;
}
let openIdConfigCache: any = null;
let publicKeysCache: { [kid: string]: string } = {};

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
        logger.debug(`Auth middleware checking for ${request.method} ${request.url}`);
        logger.debug(`Auth enabled setting: ${config.auth.enabled}`);
        
        if (request.url === '/documentation' || 
            request.url.startsWith('/documentation/') ||
            request.url.startsWith('/swagger/')) {
            logger.debug('Skipping auth for documentation route');
            return;
        }
        
        if (config.auth.enabled === false) {
            logger.debug('Authentication is disabled in config - granting access');
            return;
        }

        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn(`Missing Authorization header for ${request.method} ${request.url}`);
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication required - Bearer token missing',
                statusCode: 401
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid token format',
                statusCode: 401
            });
        }

        try {
            const decodedToken: any = jwt.decode(token, { complete: true });
            if (!decodedToken) {
                throw new Error('Invalid token format');
            }
            
            logger.debug(`Token header: ${JSON.stringify(decodedToken.header)}`);
            logger.debug(`Token payload: ${JSON.stringify(decodedToken.payload)}`);
            
            const kid = decodedToken.header.kid;
            if (!kid) {
                throw new Error('No key ID found in token header');
            }

            const tenantId = config.auth.tenantId;
            console.log(`Tenant ID: ${tenantId}`);
            if (!openIdConfigCache) {
                const configUrl = `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`;
                logger.debug(`Fetching OpenID configuration from ${configUrl}`);
                const response = await fetch(configUrl);
                openIdConfigCache = await response.json();
                logger.debug(`OpenID configuration fetched successfully`);
            }

            let signingKey = publicKeysCache[kid];
            if (!signingKey) {
                logger.debug(`Fetching signing keys from ${openIdConfigCache.jwks_uri}`);
                const keysResponse = await fetch(openIdConfigCache.jwks_uri);
                const keysData = await keysResponse.json();
                const keys = keysData.keys;
                
                const key = keys.find((k: any) => k.kid === kid);
                if (!key) {
                    throw new Error(`No matching key found for kid: ${kid}`);
                }
                
                const jwkToPem = require('jwk-to-pem');
                signingKey = jwkToPem(key);
                
                publicKeysCache[kid] = signingKey;
                logger.debug(`Signing key obtained for kid: ${kid}`);
            }
            const decodedPayload = decodedToken.payload;
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (decodedPayload.exp && decodedPayload.exp < currentTime) {
                throw new Error('Token has expired');
            }
            
            (request as AuthenticatedRequest).user = decodedPayload;
            
            logger.debug(`Token accepted for user ${decodedPayload.name || decodedPayload.upn || 'unknown'}`);

        } catch (error) {
            logger.warn('Token verification failed', { error: (error as Error).message, stack: (error as Error).stack });
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
                statusCode: 401
            });
        }
    } catch (error) {
        logger.error('Authentication error', error);
        return reply.status(500).send({
            error: 'Internal Server Error',
            message: 'An error occurred during authentication',
            statusCode: 500
        });
    }
}
