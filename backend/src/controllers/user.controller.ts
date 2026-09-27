import { Request, Response } from 'express';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse({
    res,
    message: 'User management API — endpoint structured',
    data: [],
  });
});
