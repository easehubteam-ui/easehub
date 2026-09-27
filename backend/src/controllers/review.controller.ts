import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await ReviewService.getReviews();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched reviews',
    data: { reviews },
  });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user ? user.id : 'usr_customer';
  const review = await ReviewService.createReview(userId, req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  });
});
