import type { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('API Error:', err);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}
