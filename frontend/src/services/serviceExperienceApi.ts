import { insforge } from './insforge';

export interface ServiceExperienceSettings {
  id: 'global';
  old_meals_enabled: boolean;
  new_meals_enabled: boolean;
  old_laundry_enabled: boolean;
  new_laundry_enabled: boolean;
  extra_services_enabled: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface MealServicePlan {
  id: string;
  code: string;
  name: string;
  category: 'veg' | 'non_veg' | 'both';
  billing_period: 'daily' | 'monthly';
  price: number;
  description: string;
  meals_included: string[];
  features: string[];
  is_active: boolean;
  is_available: boolean;
  availability_note: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LaundryServicePlan {
  id: string;
  code: string;
  name: string;
  billing_period: 'per_kg' | 'monthly' | 'per_item';
  price: number;
  description: string;
  services_included: string[];
  turnaround_time: string;
  pickup_available: boolean;
  is_active: boolean;
  is_available: boolean;
  availability_note: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceBookingRequest {
  catalogType:
    | 'meal_plan'
    | 'laundry_plan'
    | 'legacy_meal_provider'
    | 'legacy_laundry_provider'
    | 'service'
    | 'custom_service';
  bookingDate: string;
  address: string;
  catalogId?: string;
  duration?: number;
  quantity?: number;
  scheduledTime?: string;
  details?: string;
  customServiceName?: string;
  billingPeriod?: string;
}

export interface ServiceBookingRecord {
  id: string;
  booking_number: string;
  user_id: string;
  service_id: string | null;
  booking_type: 'MEAL' | 'LAUNDRY' | 'SERVICE';
  status: string;
  scheduled_date: string;
  scheduled_time: string | null;
  address: string;
  notes: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface AdminServiceBooking extends ServiceBookingRecord {
  users?: { id: string; name: string; email: string; phone: string; city: string; address: string };
  payment_status?: string | null;
  payment_id?: string | null;
}

const throwIfError = (error: { message?: string } | null, fallback: string): void => {
  if (error) throw new Error(error.message || fallback);
};

const defaultServiceSettings: ServiceExperienceSettings = {
  id: 'global',
  old_meals_enabled: true,
  new_meals_enabled: true,
  old_laundry_enabled: true,
  new_laundry_enabled: true,
  extra_services_enabled: true,
  updated_by: null,
  updated_at: new Date().toISOString(),
};

const normalizeSettings = (row: Partial<ServiceExperienceSettings> | null | undefined): ServiceExperienceSettings => ({
  id: 'global',
  old_meals_enabled: row?.old_meals_enabled ?? true,
  new_meals_enabled: row?.new_meals_enabled ?? true,
  old_laundry_enabled: row?.old_laundry_enabled ?? true,
  new_laundry_enabled: row?.new_laundry_enabled ?? true,
  extra_services_enabled: row?.extra_services_enabled ?? true,
  updated_by: row?.updated_by ?? null,
  updated_at: row?.updated_at ?? new Date().toISOString(),
});

const ensureGlobalSettings = async (): Promise<ServiceExperienceSettings> => {
  const { data, error } = await insforge.database
    .from('service_experience_settings')
    .select('id,old_meals_enabled,new_meals_enabled,old_laundry_enabled,new_laundry_enabled,extra_services_enabled,updated_by,updated_at')
    .eq('id', 'global')
    .maybeSingle();

  if (error) {
    const message = (error.message || '').toLowerCase();
    if (!message.includes('does not exist') && !message.includes('not found') && !message.includes('relation')) {
      throw new Error(error.message || 'Unable to load service visibility settings.');
    }
  }

  if (data) {
    return normalizeSettings(data as Partial<ServiceExperienceSettings>);
  }

  const safeDefault = normalizeSettings(defaultServiceSettings);
  const { data: inserted, error: insertError } = await insforge.database
    .from('service_experience_settings')
    .upsert({ ...safeDefault }, { onConflict: 'id' })
    .select('id,old_meals_enabled,new_meals_enabled,old_laundry_enabled,new_laundry_enabled,extra_services_enabled,updated_by,updated_at')
    .maybeSingle();

  if (insertError) {
    const message = (insertError.message || '').toLowerCase();
    if (message.includes('does not exist') || message.includes('not found') || message.includes('relation')) {
      return safeDefault;
    }
    throw new Error(insertError.message || 'Unable to initialize service visibility settings.');
  }

  return normalizeSettings((inserted ?? safeDefault) as Partial<ServiceExperienceSettings> | null | undefined);
};

export const serviceExperienceApi = {
  getSettings: async (): Promise<ServiceExperienceSettings> => {
    try {
      return await ensureGlobalSettings();
    } catch (error: any) {
      console.warn('Service settings fallback activated:', error?.message || error);
      return normalizeSettings(defaultServiceSettings);
    }
  },

  updateSettings: async (
    patch: Partial<Omit<ServiceExperienceSettings, 'id' | 'updated_by' | 'updated_at'>>
  ): Promise<ServiceExperienceSettings> => {
    const currentSettings = await ensureGlobalSettings();
    const nextSettings = normalizeSettings({
      ...currentSettings,
      ...patch,
      id: 'global',
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await insforge.database
      .from('service_experience_settings')
      .upsert({ ...nextSettings }, { onConflict: 'id' })
      .select('id,old_meals_enabled,new_meals_enabled,old_laundry_enabled,new_laundry_enabled,extra_services_enabled,updated_by,updated_at')
      .maybeSingle();

    if (error) {
      const message = (error.message || '').toLowerCase();
      if (message.includes('does not exist') || message.includes('not found') || message.includes('relation')) {
        return nextSettings;
      }
      throwIfError(error, 'Unable to save service visibility settings.');
    }

    if (!data) {
      throw new Error('Settings were not updated. Check your admin settings permission.');
    }

    return normalizeSettings(data as Partial<ServiceExperienceSettings>);
  },

  getMealPlans: async (): Promise<MealServicePlan[]> => {
    const { data, error } = await insforge.database
      .from('meal_service_plans')
      .select('id,code,name,category,billing_period,price,description,meals_included,features,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .order('sort_order', { ascending: true })
      .limit(100);
    throwIfError(error, 'Unable to load meal plans.');
    return Array.isArray(data) ? data as MealServicePlan[] : [];
  },

  createMealPlan: async (plan: Omit<MealServicePlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealServicePlan> => {
    const { data, error } = await insforge.database
      .from('meal_service_plans')
      .insert([{ ...plan }])
      .select('id,code,name,category,billing_period,price,description,meals_included,features,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .maybeSingle();
    throwIfError(error, 'Unable to create meal plan.');
    if (!data) throw new Error('Meal plan was not created.');
    return data as MealServicePlan;
  },

  updateMealPlan: async (id: string, patch: Partial<MealServicePlan>): Promise<MealServicePlan> => {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...fields } = patch;
    const { data, error } = await insforge.database
      .from('meal_service_plans')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id,code,name,category,billing_period,price,description,meals_included,features,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .maybeSingle();
    throwIfError(error, 'Unable to update meal plan.');
    if (!data) throw new Error('Meal plan was not updated.');
    return data as MealServicePlan;
  },

  getLaundryPlans: async (): Promise<LaundryServicePlan[]> => {
    const { data, error } = await insforge.database
      .from('laundry_service_plans')
      .select('id,code,name,billing_period,price,description,services_included,turnaround_time,pickup_available,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .order('sort_order', { ascending: true })
      .limit(100);
    throwIfError(error, 'Unable to load laundry plans.');
    return Array.isArray(data) ? data as LaundryServicePlan[] : [];
  },

  createLaundryPlan: async (plan: Omit<LaundryServicePlan, 'id' | 'created_at' | 'updated_at'>): Promise<LaundryServicePlan> => {
    const { data, error } = await insforge.database
      .from('laundry_service_plans')
      .insert([{ ...plan }])
      .select('id,code,name,billing_period,price,description,services_included,turnaround_time,pickup_available,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .maybeSingle();
    throwIfError(error, 'Unable to create laundry plan.');
    if (!data) throw new Error('Laundry plan was not created.');
    return data as LaundryServicePlan;
  },

  updateLaundryPlan: async (id: string, patch: Partial<LaundryServicePlan>): Promise<LaundryServicePlan> => {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...fields } = patch;
    const { data, error } = await insforge.database
      .from('laundry_service_plans')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id,code,name,billing_period,price,description,services_included,turnaround_time,pickup_available,is_active,is_available,availability_note,sort_order,created_at,updated_at')
      .maybeSingle();
    throwIfError(error, 'Unable to update laundry plan.');
    if (!data) throw new Error('Laundry plan was not updated.');
    return data as LaundryServicePlan;
  },

  createBooking: async (request: ServiceBookingRequest): Promise<ServiceBookingRecord> => {
    const { data, error } = await insforge.database.rpc('create_service_booking', {
      p_catalog_type: request.catalogType,
      p_booking_date: request.bookingDate,
      p_address: request.address,
      p_catalog_id: request.catalogId || null,
      p_duration: request.duration || 1,
      p_quantity: request.quantity || 1,
      p_scheduled_time: request.scheduledTime || null,
      p_details: request.details || '',
      p_custom_service_name: request.customServiceName || '',
      p_billing_period: request.billingPeriod || null,
    });
    throwIfError(error, 'Booking could not be saved. Please try again.');
    if (!data || typeof data !== 'object' || !('id' in data)) {
      throw new Error('Booking was not confirmed by the database.');
    }
    return data as ServiceBookingRecord;
  },

  getAdminServiceBookings: async (bookingType: 'MEAL' | 'LAUNDRY' | 'SERVICE'): Promise<AdminServiceBooking[]> => {
    const { data, error } = await insforge.database.rpc('get_admin_service_bookings', {
      p_booking_type: bookingType,
    });
    throwIfError(error, 'Unable to load service bookings for this admin module.');
    return Array.isArray(data) ? data as AdminServiceBooking[] : [];
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<ServiceBookingRecord> => {
    const { data, error } = await insforge.database.rpc('update_service_booking_status', {
      p_booking_id: bookingId,
      p_status: status,
    });
    throwIfError(error, 'Unable to update booking status.');
    if (!data || typeof data !== 'object' || !('id' in data)) {
      throw new Error('Booking status was not updated.');
    }
    return data as ServiceBookingRecord;
  },

  submitPaymentProof: async (bookingId: string, utr: string, screenshotUrl: string): Promise<unknown> => {
    const { data, error } = await insforge.database.rpc('submit_service_payment_proof', {
      p_booking_id: bookingId,
      p_utr: utr,
      p_screenshot_url: screenshotUrl,
    });
    throwIfError(error, 'Payment proof could not be saved.');
    if (!data) throw new Error('Payment proof was not confirmed by the database.');
    return data;
  },
};
