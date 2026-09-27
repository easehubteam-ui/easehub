import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { sendResponse } from '../utils/apiResponse.js';

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse({
        res,
        statusCode: 401,
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const userRole = req.user.role;

    // Superadmin has access to all admin level roles
    if (userRole === 'superadmin' && (roles.includes('admin') || roles.includes('superadmin'))) {
      next();
      return;
    }

    if (!roles.includes(userRole)) {
      sendResponse({
        res,
        statusCode: 403,
        success: false,
        message: `Access denied. Authorized roles: [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
