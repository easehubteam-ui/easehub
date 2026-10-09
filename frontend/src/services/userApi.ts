import { insforge } from './insforge';
import { UserRole, AdminPermissions } from '../types';

const projectUrl =
  (import.meta.env && import.meta.env.VITE_INSFORGE_PROJECT_URL) ||
  'https://289ybt8g.us-east.insforge.app';
const anonKey =
  (import.meta.env && import.meta.env.VITE_INSFORGE_ANON_KEY) ||
  'ik_7b864691972beda6b5dd6e5d67ea743a';

export interface UserRecord {
  id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  permissions?: AdminPermissions;
  city?: string;
  address?: string;
  created_at?: string;
  avatar_url?: string;
}

export interface CreateSubAdminInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  isActive: boolean;
  permissions: AdminPermissions;
}

export interface UpdateSubAdminInput {
  name: string;
  phone?: string;
  isActive: boolean;
  permissions: AdminPermissions;
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
   * Fetch all Sub Admins from public.users table.
   */
  async getSubAdmins(): Promise<UserRecord[]> {
    try {
      const { data: rpcData, error: rpcError } = await insforge.database.rpc('admin_get_subadmins');
      if (!rpcError && Array.isArray(rpcData)) {
        return rpcData as UserRecord[];
      }

      const { data, error } = await insforge.database
        .from('users')
        .select('*')
        .in('role', ['subadmin', 'admin', 'SUB_ADMIN', 'sub_admin'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subadmins from DB:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to get subadmins:', err);
      return [];
    }
  },

  /**
   * Create a real authenticated Sub Admin in InsForge Auth & public.users
   * without replacing the Super Admin's active session.
   */
  async createSubAdmin(
    input: CreateSubAdminInput
  ): Promise<{ success: boolean; data?: UserRecord; message?: string }> {
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanName = input.name.trim();
    const cleanPhone = input.phone?.trim() || '';

    if (!cleanName || !cleanEmail || !input.password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }

    if (input.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // Sanitize permissions (Sub Admin can never have subadmins management permission)
    const sanitizedPermissions: AdminPermissions = { ...input.permissions };
    delete (sanitizedPermissions as any).subadmins;

    try {
      // 1. Primary path: Atomic PostgreSQL SECURITY DEFINER RPC (creates/updates auth.users + public.users)
      const { data: rpcData, error: rpcError } = await insforge.database.rpc(
        'admin_upsert_subadmin',
        {
          p_name: cleanName,
          p_email: cleanEmail,
          p_password: input.password,
          p_phone: cleanPhone || null,
          p_is_active: input.isActive,
          p_permissions: sanitizedPermissions,
        }
      );

      if (!rpcError && rpcData) {
        const record = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        return {
          success: true,
          data: record as UserRecord,
          message: 'Sub Admin created successfully.',
        };
      }

      if (rpcError && rpcError.code !== 'PGRST202') {
        console.warn('admin_upsert_subadmin RPC warning, attempting direct fallback:', rpcError);
      }

      // 2. Fallback path: Register user in InsForge Auth via direct REST call so Super Admin session is untouched
      const authRes = await fetch(`${projectUrl}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: input.password,
          name: cleanName,
          autoConfirm: true,
        }),
      });

      const authJson = await authRes.json().catch(() => ({}));

      if (!authRes.ok && authRes.status !== 409) {
        const errMsg =
          authJson?.error?.message ||
          authJson?.message ||
          authJson?.error ||
          'Failed to create authenticated user in InsForge Auth.';
        if (!String(errMsg).toLowerCase().includes('already')) {
          return { success: false, message: String(errMsg) };
        }
      }

      const authUserId: string | undefined = authJson?.user?.id || authJson?.data?.user?.id;

      // Check if email already exists in public.users (e.g., customer account being promoted to subadmin)
      const { data: existingUsers } = await insforge.database
        .from('users')
        .select('*')
        .eq('email', cleanEmail);

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        const existing = existingUsers[0];
        if (String(existing.role).toLowerCase().includes('super')) {
          return {
            success: false,
            message: 'Cannot convert a Super Admin account into a Sub Admin.',
          };
        }

        const { data: updated, error: updateError } = await insforge.database
          .from('users')
          .update({
            ...(authUserId ? { auth_user_id: authUserId } : {}),
            name: cleanName,
            ...(cleanPhone ? { phone: cleanPhone } : {}),
            role: 'subadmin',
            is_active: input.isActive,
            permissions: sanitizedPermissions,
          })
          .eq('id', existing.id)
          .select('*');

        if (updateError || !updated || updated.length === 0) {
          return {
            success: false,
            message: updateError?.message || 'Failed to update Sub Admin profile in database.',
          };
        }

        return {
          success: true,
          data: updated[0] as UserRecord,
          message: 'Sub Admin created successfully.',
        };
      }

      // 3. Insert profile into public.users
      let { data: inserted, error: insertError } = await insforge.database
        .from('users')
        .insert([
          {
            ...(authUserId ? { auth_user_id: authUserId } : {}),
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || null,
            role: 'subadmin',
            is_active: input.isActive,
            permissions: sanitizedPermissions,
          },
        ])
        .select('*');

      // Retry without phone if phone already exists on another user (users_phone_key)
      if (insertError && cleanPhone) {
        const retry = await insforge.database
          .from('users')
          .insert([
            {
              ...(authUserId ? { auth_user_id: authUserId } : {}),
              name: cleanName,
              email: cleanEmail,
              phone: null,
              role: 'subadmin',
              is_active: input.isActive,
              permissions: sanitizedPermissions,
            },
          ])
          .select('*');
        inserted = retry.data;
        insertError = retry.error;
      }

      if (insertError || !inserted || inserted.length === 0) {
        console.error('Error inserting subadmin profile:', insertError);
        return {
          success: false,
          message: insertError?.message || 'Failed to save Sub Admin profile in database.',
        };
      }

      return {
        success: true,
        data: inserted[0] as UserRecord,
        message: 'Sub Admin created successfully.',
      };
    } catch (err: any) {
      console.error('createSubAdmin exception:', err);
      return {
        success: false,
        message: err?.message || 'Unexpected error while creating Sub Admin.',
      };
    }
  },

  /**
   * Update Sub Admin details, status, and module permissions.
   */
  async updateSubAdmin(
    userId: string,
    input: UpdateSubAdminInput
  ): Promise<{ success: boolean; data?: UserRecord; message?: string }> {
    try {
      const sanitizedPermissions: AdminPermissions = { ...input.permissions };
      delete (sanitizedPermissions as any).subadmins;

      const { data, error } = await insforge.database
        .from('users')
        .update({
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          is_active: input.isActive,
          permissions: sanitizedPermissions,
        })
        .eq('id', userId)
        .select('*');

      if (error) {
        console.error('Error updating subadmin:', error);
        return {
          success: false,
          message: error.message || 'Failed to update Sub Admin.',
        };
      }

      return {
        success: true,
        data: Array.isArray(data) && data.length > 0 ? (data[0] as UserRecord) : undefined,
        message: 'Sub Admin permissions & profile updated.',
      };
    } catch (err: any) {
      console.error('updateSubAdmin exception:', err);
      return {
        success: false,
        message: err?.message || 'Failed to update Sub Admin.',
      };
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
      // First try hard deletion
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
        // Fallback to deactivating user
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
