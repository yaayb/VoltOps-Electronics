import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { clearAuthCookie, setAuthCookie, signAuthToken, UserRole } from '../utils/token';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as RegisterInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const role = user.role as UserRole;
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    role,
    name: user.name,
  });

  setAuthCookie(res, token);

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      createdAt: user.createdAt,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const role = user.role as UserRole;
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    role,
    name: user.name,
  });

  setAuthCookie(res, token);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      createdAt: user.createdAt,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.json({ message: 'Signed out successfully.' });
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('Not authenticated.', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    clearAuthCookie(res);
    throw new AppError('User account no longer exists.', 401, 'USER_NOT_FOUND');
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    },
  });
});
