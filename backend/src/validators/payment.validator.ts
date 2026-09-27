import { z } from 'zod';

export const submitQrPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    utr: z.string().min(6, 'UTR / Transaction ID is required'),
    screenshotUrl: z.string().optional(),
  }),
});
