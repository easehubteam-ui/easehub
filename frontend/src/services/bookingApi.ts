import { insforge } from './insforge';

export interface BookingRecord {
  id?: string;
  _id?: string;
  bookingNumber: string;
  user: any;
  userName?: string;
  userPhone?: string;
  service?: any;
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
      const { data } = await insforge.database.from('bookings').select('*');
      return Array.isArray(data) ? data : [];
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
    const { data: userRes } = await insforge.auth.getCurrentUser();
    if (!userRes?.user) throw new Error('Authentication required');

    const { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id);

    const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
    if (!profile) throw new Error('User profile not found');

    const payload = {
      userId: profile.id,
      serviceId: (data as any).serviceId || null,
      bookingType: data.serviceType || 'SERVICE',
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      scheduledTime: data.scheduledTime || '',
      address: data.address || '',
      notes: data.description || '',
      amount: data.amount || 0
    };

    const res = await insforge.functions.invoke('create-booking', { body: payload });
    return res.data;
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

