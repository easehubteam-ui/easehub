import { z } from 'zod';

export const createLaundrySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Laundry Provider Name is required'),
    ownerName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    pricePerKg: z.number().optional(),
    steamIronPerPc: z.number().optional(),
    turnaroundHours: z.number().optional(),
    corridor: z.string().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    status: z.enum(['active', 'pending', 'paused']).optional(),
  }),
});
