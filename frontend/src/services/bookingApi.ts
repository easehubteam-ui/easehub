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

    let { data: profiles } = await insforge.database
      .from('users')
      .select('id')
      .eq('auth_user_id', userRes.user.id);

    let profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

    if (!profile) {
      const { data: emailProfiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('email', userRes.user.email || '');

      if (Array.isArray(emailProfiles) && emailProfiles.length > 0) {
        profile = emailProfiles[0];
      } else {
        const authUser: any = userRes.user;
        const { data: insertedUser } = await insforge.database
          .from('users')
          .insert([{
            auth_user_id: authUser.id,
            name: authUser.name || authUser.profile?.name || 'EaseHub Customer',
            email: authUser.email || '',
            phone: authUser.phone || authUser.profile?.phone || '6201614778',
            role: 'customer'
          }])
          .select('id');
        if (insertedUser && insertedUser.length > 0) {
          profile = insertedUser[0];
        }
      }
    }

    if (!profile?.id) throw new Error('User profile resolution failed');

    // Clean booking type for PostgreSQL enum constraint: ('PG', 'MEAL', 'LAUNDRY', 'SERVICE')
    let cleanType = (data.serviceType || 'PG').toUpperCase();
    if (cleanType === 'MEALS') cleanType = 'MEAL';
    if (!['PG', 'MEAL', 'LAUNDRY', 'SERVICE'].includes(cleanType)) {
      cleanType = 'PG';
    }

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bkNum = `EHB-${dateStr}-${randomSuffix}`;

    const { data: inserted, error: dbErr } = await insforge.database
      .from('bookings')
      .insert([{
        booking_number: bkNum,
        user_id: profile.id,
        service_id: (data as any).serviceId || null,
        booking_type: cleanType,
        status: 'PENDING',
        scheduled_date: data.scheduledDate || new Date().toISOString(),
        scheduled_time: data.scheduledTime || null,
        address: data.address || 'Bhilai, Chhattisgarh',
        notes: data.serviceName || data.description || 'EaseHub Accommodation & Living Service',
        amount: data.amount || 4500
      }])
      .select('*');

    if (dbErr) {
      console.error('Direct booking insert error:', dbErr);
      throw new Error(`Unable to create booking in database: ${dbErr.message}`);
    }

    if (!inserted || inserted.length === 0) {
      throw new Error('Failed to create booking record in database.');
    }

    const bookingRow = inserted[0];

    // Initialize payment record in 'payments' table linked by booking_id
    try {
      await insforge.database
        .from('payments')
        .insert([{
          booking_id: bookingRow.id,
          user_id: profile.id,
          amount: bookingRow.amount,
          payment_method: 'qr',
          status: 'VERIFICATION_PENDING'
        }]);
    } catch (payErr) {
      console.warn('Payment record initialization notice:', payErr);
    }

    // Fire edge function in background if deployed
    insforge.functions.invoke('create-booking', {
      body: {
        bookingId: bookingRow.id,
        userId: profile.id,
        bookingNumber: bkNum,
        amount: bookingRow.amount
      }
    }).catch(() => {});

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
      createdAt: bookingRow.created_at
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

