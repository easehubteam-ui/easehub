import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  let bookings;
  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    bookings = await BookingService.getAllBookings();
  } else if (user) {
    bookings = await BookingService.getUserBookings(user.id);
  } else {
    bookings = await BookingService.getAllBookings();
  }

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched bookings',
    data: { bookings },
  });
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookings = await BookingService.getUserBookings(user.id);
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Fetched user bookings',
    data: { bookings },
  });
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user ? user.id : 'usr_customer';
  const booking = await BookingService.createBooking(userId, req.body);
  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Booking created successfully',
    data: { booking },
  });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status, vendor, roomNumber } = req.body;
  const booking = await BookingService.updateStatus(id, status, { vendor, roomNumber });
  if (!booking) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Booking not found',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Booking status updated successfully',
    data: { booking },
  });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = (req as any).user;
  const userId = user ? user.id : 'usr_customer';
  const booking = await BookingService.cancelBooking(id, userId);
  if (!booking) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'Booking not found or already processed',
    });
  }
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking },
  });
});
