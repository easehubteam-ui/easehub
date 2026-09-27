import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    scheduledTime: z.string().optional(),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    description: z.string().optional(),
  }),
});
