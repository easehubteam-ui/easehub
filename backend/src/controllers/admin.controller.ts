import { Request, Response } from 'express';
import { PGService } from '../services/pg.service.js';
import { MealService } from '../services/meal.service.js';
import { LaundryService } from '../services/laundry.service.js';
import { ExtraService } from '../services/service.service.js';
import { BookingService } from '../services/booking.service.js';
import { PaymentService } from '../services/payment.service.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const pgs = await PGService.getAll();
  const meals = await MealService.getAll();
  const laundry = await LaundryService.getAll();
  const services = await ExtraService.getAll();
  const bookings = await BookingService.getAllBookings();
  const paymentsStats = await PaymentService.getPaymentStats();

  const isMongoConnected = mongoose.connection.readyState === 1;
  const totalUsers = isMongoConnected ? await User.countDocuments() : 0;
  const totalVendors = isMongoConnected ? await User.countDocuments({ role: 'vendor' }) : 0;

  const totalPGs = pgs.length;
  const totalBeds = pgs.reduce((acc: number, item: any) => acc + (item.totalBeds || 0), 0);
  const occupiedBeds = pgs.reduce((acc: number, item: any) => acc + (item.occupiedBeds || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalMealProviders = meals.length;
  const activeTiffins = meals.reduce((acc: number, item: any) => acc + (item.activeTiffins || 0), 0);

  const totalLaundryProviders = laundry.length;
  const totalExtraServices = services.length;
  const totalBookingsCount = bookings.length;

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Admin Dashboard statistics fetched',
    data: {
      stats: {
        totalUsers,
        totalVendors,
        totalPGs,
        totalBeds,
        occupiedBeds,
        occupancyRate,
        totalMealProviders,
        activeTiffins,
        totalLaundryProviders,
        totalExtraServices,
        totalBookingsCount,
        escrowVolume: paymentsStats.totalEscrowVolume,
        pendingPaymentsCount: paymentsStats.pendingCount,
        pendingPaymentsAmount: paymentsStats.pendingAmount,
        verifiedPaymentsCount: paymentsStats.verifiedCount,
      },
      counts: {
        pgs: totalPGs,
        meals: totalMealProviders,
        laundry: totalLaundryProviders,
        services: totalExtraServices,
        bookings: totalBookingsCount,
      },
    },
  });
});
