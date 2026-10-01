import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const publishedOnly = req.query.all !== 'true';
  const status = req.query.status as string;
  const reviews = await ReviewService.getReviews({ publishedOnly, status });
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched reviews successfully',
    data: { reviews },
  });
});

export const getAdminReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await ReviewService.getAdminReviews();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched all reviews for admin moderation',
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

export const updateReviewStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;
  if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
    return sendResponse({
      res,
      statusCode: 400,
      success: false,
      message: 'Valid status (approved, pending, rejected) is required',
    });
  }
  const updated = await ReviewService.updateReviewStatus(id, status);
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: `Review ${status} successfully`,
    data: { review: updated },
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await ReviewService.deleteReview(id);
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Review deleted successfully',
  });
});
