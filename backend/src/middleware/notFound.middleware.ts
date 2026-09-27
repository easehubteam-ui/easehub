import { Request, Response } from 'express';
import { sendResponse } from '../utils/apiResponse.js';

export const notFoundMiddleware = (req: Request, res: Response) => {
  return sendResponse({
    res,
    statusCode: 404,
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    errors: [],
  });
};
