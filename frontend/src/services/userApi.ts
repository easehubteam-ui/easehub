import { insforge } from './insforge';
import { UserRole } from '../types';

export interface UserRecord {
  id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  city?: string;
  address?: string;
  created_at?: string;
  avatar_url?: string;
}

export const userApi = {
  /**
   * Fetch all users from InsForge PostgreSQL public.users table.
   */
  async getAll(): Promise<UserRecord[]> {
    try {
      const { data, error } = await insforge.database
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users from DB:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to get users:', err);
      return [];
    }
  },

  /**
   * Get real booking & payment counts for a user from PostgreSQL.
   */
  async getUserActivityCounts(userId: string): Promise<{ bookingCount: number; paymentCount: number }> {
    try {
      const { count: bookingCount } = await insforge.database
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: paymentCount } = await insforge.database
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        bookingCount: bookingCount || 0,
        paymentCount: paymentCount || 0,
      };
    } catch (err) {
      return { bookingCount: 0, paymentCount: 0 };
    }
  },

  /**
   * Toggle block/unblock status for a user record in PostgreSQL.
   */
  async toggleBlock(userId: string, currentStatus: boolean): Promise<boolean> {
    try {
      const { error } = await insforge.database
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling user status:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      return false;
    }
  },

  /**
   * Safely delete or deactivate a user record in PostgreSQL.
   */
  async deleteUser(userId: string): Promise<{ success: boolean; softDeleted?: boolean; message?: string }> {
    try {
      // Delete associated saved items first
      await insforge.database
        .from('saved_items')
        .delete()
        .eq('user_id', userId);

      const { error: deleteError } = await insforge.database
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.warn('Permanent delete failed due to DB references, soft-deactivating user instead:', deleteError);
        const { error: updateError } = await insforge.database
          .from('users')
          .update({ is_active: false })
          .eq('id', userId);

        if (updateError) {
          return { success: false, message: updateError.message || 'Failed to delete user.' };
        }
        return { success: true, softDeleted: true, message: 'User deactivated because dependent activity records exist.' };
      }

      return { success: true, softDeleted: false, message: 'User deleted successfully.' };
    } catch (err: any) {
      console.error('Error deleting user:', err);
      return { success: false, message: err?.message || 'Failed to delete user.' };
    }
  }
};
