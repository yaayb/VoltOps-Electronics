import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({
      error: details[0]?.message || 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'A record with that unique identifier (SKU, Serial, Email, or Code) already exists.',
        code: 'DUPLICATE_RECORD',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: 'Requested record was not found.',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  console.error('[VoltOps API Error]:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({
    error: message,
    code: 'INTERNAL_SERVER_ERROR',
  });
}
