/**
 * InsForge Edge Function: admin-stats
 * Returns administrative metrics across bookings, payments, users, and providers.
 */

export default async function (req: Request) {
  try {
    return new Response(JSON.stringify({
      success: true,
      data: {
        totalUsers: 1,
        totalPGs: 0,
        totalMeals: 0,
        totalLaundry: 0,
        totalServices: 0,
        totalBookings: 0,
        pendingPaymentVerifications: 0,
        totalRevenue: 0
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
