import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  if (env.NODE_ENV === 'development') {
    console.error('API Error:', err);
  }

  return sendResponse({
    res,
    statusCode,
    success: false,
    message,
    errors,
  });
};
