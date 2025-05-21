import { JwtPayload } from 'jsonwebtoken';
import { logger } from './logger';

export function extractUserRoles(decodedToken: JwtPayload): string[] {
  try {
    if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
      return decodedToken.roles;
    } else if (decodedToken.scp && typeof decodedToken.scp === 'string') {
      return decodedToken.scp.split(' ');
    } else if (decodedToken.scope && typeof decodedToken.scope === 'string') {
      return decodedToken.scope.split(' ');
    }
    return [];
  } catch (error) {
    logger.error('Error extracting user roles from token', error);
    return [];
  }
}

export function getUserEmail(decodedToken: JwtPayload): string | null {
  return decodedToken.email || 
         decodedToken.preferred_username || 
         decodedToken.upn || 
         null;
}
