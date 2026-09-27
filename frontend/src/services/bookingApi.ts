import { api } from './api';

export interface BookingRecord {
  _id: string;
  bookingNumber: string;
  user: any;
  userName?: string;
  userPhone?: string;
  service?: any;
  serviceName?: string;
  serviceType?: string;
  roomType?: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  scheduledDate: string;
  scheduledTime?: string;
  address: string;
  description?: string;
  amount: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const bookingApi = {
  getBookings: async () => {
    const res = await api.get('/bookings');
    return res.data?.data?.bookings || [];
  },
  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data?.data?.bookings || [];
  },
  createBooking: async (data: Partial<BookingRecord>) => {
    const res = await api.post('/bookings', data);
    return res.data?.data?.booking;
  },
  updateStatus: async (id: string, status: string, vendor?: string, roomNumber?: string) => {
    const res = await api.put(`/bookings/${id}/status`, { status, vendor, roomNumber });
    return res.data?.data?.booking;
  },
  cancelBooking: async (id: string) => {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data?.data?.booking;
  },
};
