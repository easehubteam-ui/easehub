/**
 * InsForge Edge Function: admin-stats
 * Returns administrative metrics across bookings, payments, users, and providers.
 */

export default async function (req: Request) {
  try {
    const baseUrl = process.env.INSFORGE_PROJECT_URL || 'https://289ybt8g.us-east.insforge.app';
    const anonKey = process.env.INSFORGE_ANON_KEY || 'ik_7b864691972beda6b5dd6e5d67ea743a';

    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    };

    const countTable = async (table: string) => {
      try {
        const res = await fetch(`${baseUrl}/rest/v1/${table}?select=id`, { headers });
        const contentRange = res.headers.get('content-range');
        if (contentRange) {
          const parts = contentRange.split('/');
          if (parts[1] && parts[1] !== '*') return parseInt(parts[1], 10);
        }
        const data = await res.json();
        return Array.isArray(data) ? data.length : 0;
      } catch (e) {
        return 0;
      }
    };

    const [totalUsers, totalPGs, totalMeals, totalLaundry, totalServices, totalBookings] = await Promise.all([
      countTable('users'),
      countTable('pgs'),
      countTable('meal_providers'),
      countTable('laundry_providers'),
      countTable('services'),
      countTable('bookings')
    ]);

    // Query payments for verified revenue & pending count
    let totalRevenue = 0;
    let pendingPaymentsCount = 0;
    let verifiedPaymentsCount = 0;

    try {
      const payRes = await fetch(`${baseUrl}/rest/v1/payments?select=amount,status`, { headers });
      const payments = await payRes.json();
      if (Array.isArray(payments)) {
        payments.forEach((p: any) => {
          if (p.status === 'verified') {
            verifiedPaymentsCount++;
            totalRevenue += Number(p.amount) || 0;
          } else if (p.status === 'pending') {
            pendingPaymentsCount++;
          }
        });
      }
    } catch (e) {}

    return new Response(JSON.stringify({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalPGs: totalPGs || 0,
        totalMealProviders: totalMeals || 0,
        totalLaundryProviders: totalLaundry || 0,
        totalServices: totalServices || 0,
        totalBookingsCount: totalBookings || 0,
        pendingPaymentsCount,
        verifiedPaymentsCount,
        totalRevenue
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
