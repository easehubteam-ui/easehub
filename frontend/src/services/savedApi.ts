import { insforge } from './insforge';

export interface SavedItemRecord {
  id: string;
  user_id: string;
  item_type: 'pg' | 'meals' | 'laundry' | 'services';
  item_id: string;
  created_at?: string;
}

export const savedApi = {
  /**
   * Fetch all saved items for the currently authenticated user from PostgreSQL.
   */
  async getSavedItems(): Promise<SavedItemRecord[]> {
    try {
      const { data: authData } = await insforge.auth.getCurrentUser();
      if (!authData?.user) {
        return [];
      }

      // Fetch user profile id from public.users
      const { data: userProfiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('auth_user_id', authData.user.id);

      const userId = Array.isArray(userProfiles) && userProfiles.length > 0 ? userProfiles[0].id : null;
      if (!userId) return [];

      const { data, error } = await insforge.database
        .from('saved_items')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching saved items:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Failed to get saved items:', err);
      return [];
    }
  },

  /**
   * Add an item to user's saved_items in PostgreSQL.
   */
  async saveItem(itemType: 'pg' | 'meals' | 'laundry' | 'services', itemId: string): Promise<SavedItemRecord | null> {
    try {
      const { data: authData } = await insforge.auth.getCurrentUser();
      if (!authData?.user) {
        throw new Error('User not logged in');
      }

      const { data: userProfiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('auth_user_id', authData.user.id);

      const userId = Array.isArray(userProfiles) && userProfiles.length > 0 ? userProfiles[0].id : null;
      if (!userId) {
        throw new Error('User profile not found');
      }

      // Check if already saved
      const { data: existing } = await insforge.database
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (Array.isArray(existing) && (existing as any[]).length > 0) {
        return (existing as any[])[0];
      }

      const { data, error } = await insforge.database
        .from('saved_items')
        .insert([{
          user_id: userId,
          item_type: itemType,
          item_id: itemId
        }]);

      if (error) {
        console.error('Failed to save item:', error);
        throw error;
      }

      const inserted = Array.isArray(data) && (data as any[]).length > 0 ? (data as any[])[0] : null;
      return inserted;
    } catch (err) {
      console.error('Error saving item:', err);
      throw err;
    }
  },

  /**
   * Remove an item from user's saved_items in PostgreSQL.
   */
  async removeSavedItem(itemType: 'pg' | 'meals' | 'laundry' | 'services', itemId: string): Promise<boolean> {
    try {
      const { data: authData } = await insforge.auth.getCurrentUser();
      if (!authData?.user) return false;

      const { data: userProfiles } = await insforge.database
        .from('users')
        .select('id')
        .eq('auth_user_id', authData.user.id);

      const userId = Array.isArray(userProfiles) && userProfiles.length > 0 ? userProfiles[0].id : null;
      if (!userId) return false;

      const { error } = await insforge.database
        .from('saved_items')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        console.error('Error removing saved item:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error removing saved item:', err);
      return false;
    }
  },

  /**
   * Remove by saved_items record id
   */
  async removeSavedItemById(id: string): Promise<boolean> {
    try {
      const { error } = await insforge.database
        .from('saved_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing saved item by id:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error removing saved item by id:', err);
      return false;
    }
  }
};
