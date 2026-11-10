import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export const AUTH_COOKIE_NAME = 'voltops_token';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'voltops-super-secret-jwt-key-change-in-prod';
}

export function signAuthToken(payload: JwtUserPayload): string {
  const expiresInEnv = process.env.JWT_EXPIRES_IN || '7d';
  const options: SignOptions = {
    expiresIn: expiresInEnv as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyAuthToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.email !== 'string' ||
    typeof decoded.role !== 'string' ||
    typeof decoded.name !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  const validRoles: UserRole[] = ['ADMIN', 'STAFF', 'CUSTOMER'];
  if (!validRoles.includes(decoded.role as UserRole)) {
    throw new Error('Invalid user role in token');
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role as UserRole,
    name: decoded.name,
  };
}

export function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  });
}
