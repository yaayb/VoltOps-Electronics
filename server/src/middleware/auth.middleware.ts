import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AUTH_COOKIE_NAME, JwtUserPayload, UserRole, verifyAuthToken } from '../utils/token';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const cookieToken: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export const requireAuth: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);
  if (!token) {
    next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
    return;
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    next(new AppError('Session expired or invalid token. Please sign in again.', 401, 'INVALID_TOKEN'));
  }
};

export const optionalAuth: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyAuthToken(token);
    } catch {
      // Ignore expired optional cookies on public endpoints
    }
  }
  next();
};

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}.`,
          403,
          'FORBIDDEN'
        )
      );
      return;
    }

    next();
  };
}
