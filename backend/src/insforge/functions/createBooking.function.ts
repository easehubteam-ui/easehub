/**
 * InsForge Edge Function: create-booking
 * Validates request, checks item availability, calculates pricing/deposit, inserts `bookings` record.
 */

import { createClient } from '@insforge/sdk';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

export default async function (req: Request) {
  try {
    if (req.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed' }, 405);
    }

    const payload: any = await req.json().catch(() => ({}));
    const { listingId, bookingType, scheduledDate, scheduledTime, address, notes } = payload;
    const cleanType = String(bookingType || '').toUpperCase() === 'MEALS' ? 'MEAL' : String(bookingType || '').toUpperCase();

    if (!listingId || !['PG', 'MEAL', 'LAUNDRY', 'SERVICE'].includes(cleanType) || !scheduledDate || !address) {
      return json({ success: false, error: 'Missing required booking fields' }, 400);
    }

    const authorization = req.headers.get('authorization');
    const anonKey = process.env.INSFORGE_ANON_KEY || '';
    const baseUrl = process.env.INSFORGE_PROJECT_URL || '';
    if (!authorization || !anonKey || !baseUrl) return json({ success: false, error: 'Authenticated InsForge context is unavailable' }, 401);

    const client = createClient({ baseUrl, anonKey });
    client.setAccessToken(authorization.replace(/^Bearer\s+/i, ''));
    const { data: authData, error: authError } = await client.auth.getCurrentUser();
    if (authError || !authData?.user?.id) return json({ success: false, error: 'Authentication required' }, 401);

    const { data: profiles, error: profileError } = await client.database
      .from('users')
      .select('id, role, is_active')
      .eq('auth_user_id', authData.user.id)
      .limit(1);
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (profileError || !profile?.id || String(profile.role).toLowerCase() !== 'customer' || profile.is_active === false) {
      return json({ success: false, error: 'Active customer profile required' }, 403);
    }

    const tableByType: Record<string, string> = {
      PG: 'pgs',
      MEAL: 'meal_providers',
      LAUNDRY: 'laundry_providers',
      SERVICE: 'services',
    };
    let listingQuery = client.database
      .from(tableByType[cleanType])
      .select('*')
      .eq('id', listingId)
      .eq('is_active', true);
    if (cleanType !== 'SERVICE') listingQuery = listingQuery.eq('status', 'active');
    const { data: listings, error: listingError } = await listingQuery.limit(1);
    const listing = Array.isArray(listings) ? listings[0] : null;
    if (listingError || !listing) return json({ success: false, error: 'Listing is not available for booking' }, 404);

    const pricing = listing.pricing || {};
    const amount = cleanType === 'PG'
      ? Number(listing.price)
      : cleanType === 'MEAL'
        ? Number(listing.daily_price)
        : cleanType === 'LAUNDRY'
          ? Number(pricing.perKg || pricing.pricePerKg || pricing.startingPrice)
          : Number(listing.starting_price);
    if (!Number.isFinite(amount) || amount <= 0) return json({ success: false, error: 'Listing has no valid payable amount' }, 409);

    // Generate a unique booking number: EHB-YYMMDD-XXXX.
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    const bookingNumber = `EHB-${dateStr}-${randomSuffix}`;

    const bookingData = {
      booking_number: bookingNumber,
      user_id: profile.id,
      service_id: cleanType === 'SERVICE' ? listingId : null,
      booking_type: cleanType,
      status: 'PENDING',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime || null,
      address,
      notes: notes || listing.name || null,
      amount
    };

    const { data: inserted, error: insertError } = await client.database
      .from('bookings')
      .insert([bookingData])
      .select('*');
    if (insertError || !Array.isArray(inserted) || !inserted[0]) {
      return json({ success: false, error: insertError?.message || 'Booking creation failed' }, 409);
    }

    return json({ success: true, data: { bookingNumber, booking: inserted[0] } }, 201);
  } catch (err: any) {
    return json({ success: false, error: err.message || 'Booking creation failed' }, 500);
  }
}
