/**
 * InsForge Edge Function: admin-stats
 * Aggregates administrative system statistics across bookings, payments, users, and providers.
 */

export async function handleAdminStats(
  context: { dbClient: any }
): Promise<{ success: boolean; data?: any; error?: string; statusCode: number }> {
  try {
    const [
      usersCount,
      pgsCount,
      mealsCount,
      laundryCount,
      servicesCount,
      bookingsCount,
      pendingPaymentsCount
    ] = await Promise.all([
      context.dbClient.from('users').select('id', { count: 'exact', head: true }),
      context.dbClient.from('pgs').select('id', { count: 'exact', head: true }),
      context.dbClient.from('meal_providers').select('id', { count: 'exact', head: true }),
      context.dbClient.from('laundry_providers').select('id', { count: 'exact', head: true }),
      context.dbClient.from('services').select('id', { count: 'exact', head: true }),
      context.dbClient.from('bookings').select('id', { count: 'exact', head: true }),
      context.dbClient.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'VERIFICATION_PENDING')
    ]);

    // Calculate total verified revenue
    const { data: verifiedPayments } = await context.dbClient
      .from('payments')
      .select('amount')
      .eq('status', 'VERIFIED');

    const totalRevenue = verifiedPayments
      ? verifiedPayments.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0)
      : 0;

    return {
      success: true,
      data: {
        totalUsers: usersCount.count || 0,
        totalPGs: pgsCount.count || 0,
        totalMeals: mealsCount.count || 0,
        totalLaundry: laundryCount.count || 0,
        totalServices: servicesCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        pendingPaymentVerifications: pendingPaymentsCount.count || 0,
        totalRevenue
      },
      statusCode: 200
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error executing admin-stats function',
      statusCode: 500
    };
  }
}
