import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendResponse } from '../utils/apiResponse.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // 1. Read token from HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Optionally support Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};
