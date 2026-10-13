import { insforge } from './insforge';

export interface BookingRecord {
  id?: string;
  _id?: string;
  bookingNumber: string;
  user: any;
  userName?: string;
  userPhone?: string;
  service?: any;
  serviceId?: string;
  serviceName?: string;
  serviceType?: string;
  roomType?: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
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
    try {
      // Try to join users table for customer info
      const { data, error } = await insforge.database
        .from('bookings')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            phone,
            city,
            address
          ),
          services:service_id (
            id,
            name,
            service_type,
            category
          )
        `);
      if (error || !Array.isArray(data)) {
        // Fallback: plain select
        const { data: plain } = await insforge.database.from('bookings').select('*');
        return Array.isArray(plain) ? plain : [];
      }
      return data;
    } catch (err) {
      return [];
    }
  },
  getMyBookings: async () => {
    try {
      const { data: userRes } = await insforge.auth.getCurrentUser();
      if (!userRes?.user) return [];

      const { data: profiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('auth_user_id', userRes.user.id);

      const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
      if (!profile) return [];

      const { data } = await insforge.database
        .from('bookings')
        .select('*')
        .eq('user_id', profile.id);

      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },
  createBooking: async (data: Partial<BookingRecord>) => {
    const { data: result, error } = await insforge.functions.invoke('create-booking', {
      body: {
        listingId: (data as any).serviceId,
        bookingType: data.serviceType,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        address: data.address,
        notes: data.description,
      }
    });
    if (error || !result?.success || !result?.data?.booking) {
      throw new Error(error?.message || result?.error || 'Unable to create booking.');
    }
    const bookingRow = result.data.booking;
    return {
      id: bookingRow.id,
      _id: bookingRow.id,
      bookingNumber: bookingRow.booking_number,
      booking_number: bookingRow.booking_number,
      userId: bookingRow.user_id,
      serviceName: bookingRow.notes,
      amount: Number(bookingRow.amount),
      status: bookingRow.status,
      scheduledDate: bookingRow.scheduled_date,
      address: bookingRow.address,
      createdAt: bookingRow.created_at,
    };
  },
  updateStatus: async (id: string, status: string, vendor?: string, roomNumber?: string) => {
    const res = await insforge.functions.invoke('update-booking-status', {
      body: { bookingId: id, status }
    });
    return res.data;
  },
  cancelBooking: async (id: string) => {
    const res = await insforge.functions.invoke('update-booking-status', {
      body: { bookingId: id, status: 'CANCELLED' }
    });
    return res.data;
  },
  deleteBooking: async (id: string) => {
    try {
      const { error } = await insforge.database
        .from('bookings')
        .delete()
        .eq('id', id);
      if (error) {
        await bookingApi.cancelBooking(id);
      }
      return true;
    } catch (err) {
      await bookingApi.cancelBooking(id);
      return true;
    }
  },
};

