import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  let payments;
  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    payments = await PaymentService.getAllPayments();
  } else if (user) {
    payments = await PaymentService.getUserPayments(user.id);
  } else {
    payments = await PaymentService.getAllPayments();
  }

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched payments',
    data: { payments },
  });
});

export const submitPaymentProof = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user ? user.id : 'usr_customer';
  const payment = await PaymentService.createEscrowPayment(userId, req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Payment proof submitted for verification',
    data: { payment },
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = (req as any).user;
  const adminId = user ? user.id : 'admin_system';
  const payment = await PaymentService.verifyPayment(id, adminId);
  if (!payment) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Payment record not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Payment verified successfully',
    data: { payment },
  });
});

export const rejectPayment = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;
  const user = (req as any).user;
  const adminId = user ? user.id : 'admin_system';
  const payment = await PaymentService.rejectPayment(id, adminId, reason || 'Invalid UTR or screenshot');
  if (!payment) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Payment record not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Payment rejected',
    data: { payment },
  });
});

export const getPaymentStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await PaymentService.getPaymentStats();
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched payment stats',
    data: stats,
  });
});
