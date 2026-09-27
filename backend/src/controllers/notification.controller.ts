import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user ? user.id : 'usr_customer';
  const notifications = await NotificationService.getUserNotifications(userId);
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched user notifications',
    data: { notifications },
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const notification = await NotificationService.markAsRead(id);
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});
