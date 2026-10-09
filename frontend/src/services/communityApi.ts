import { insforge } from './insforge';

export interface CommunityMessage {
  id: string;
  user_id: string;
  message: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  status?: 'sending' | 'sent' | 'failed';
  error?: string;
}

export const communityApi = {
  /**
   * Fetch recent community messages ordered chronologically
   */
  getMessages: async (includeDeleted = false): Promise<CommunityMessage[]> => {
    try {
      let query = insforge.database
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      const { data: rawMessages, error } = await query;
      if (error || !Array.isArray(rawMessages)) {
        console.error('Error fetching community messages:', error);
        return [];
      }

      if (rawMessages.length === 0) return [];

      // Collect user profiles
      const userIds = Array.from(new Set(rawMessages.map((m: any) => m.user_id).filter(Boolean)));
      let userMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await insforge.database
          .from('users')
          .select('id, name, avatar_url, role')
          .in('id', userIds);
        if (Array.isArray(usersData)) {
          usersData.forEach((u: any) => {
            userMap[u.id] = u;
          });
        }
      }

      return rawMessages.map((m: any) => ({
        ...m,
        user: userMap[m.user_id] || null,
        status: 'sent',
      }));
    } catch (err: any) {
      console.error('communityApi.getMessages error:', err);
      return [];
    }
  },

  /**
   * Send a new message to the community
   */
  sendMessage: async (messageText: string, currentUserId: string): Promise<CommunityMessage> => {
    if (!messageText.trim()) {
      throw new Error('Message cannot be empty');
    }
    if (!currentUserId) {
      throw new Error('User must be authenticated to send messages');
    }

    try {
      const { data, error } = await insforge.database
        .from('community_messages')
        .insert([
          {
            user_id: currentUserId,
            message: messageText.trim(),
            is_deleted: false,
          },
        ])
        .select('*');

      if (error || !data || data.length === 0) {
        console.error('Error inserting community message:', error);
        throw new Error(error?.message || 'Failed to send message');
      }

      const created = data[0] as CommunityMessage;

      // Attach sender info
      const { data: userProfiles } = await insforge.database
        .from('users')
        .select('id, name, avatar_url, role')
        .eq('id', currentUserId);

      if (userProfiles && userProfiles.length > 0) {
        created.user = userProfiles[0];
      }
      created.status = 'sent';

      // Broadcast over Realtime if available
      try {
        if (insforge.realtime) {
          insforge.realtime.publish('community-chat', 'new_message', created).catch(() => {});
        }
      } catch {}

      return created;
    } catch (err: any) {
      console.error('communityApi.sendMessage error:', err);
      throw err;
    }
  },

  /**
   * Soft-delete a message (Admin moderation)
   */
  deleteMessage: async (messageId: string, adminUserId: string): Promise<void> => {
    try {
      const { error } = await insforge.database
        .from('community_messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error soft-deleting community message:', error);
        throw new Error(error.message);
      }

      try {
        if (insforge.realtime) {
          insforge.realtime.publish('community-chat', 'delete_message', { id: messageId }).catch(() => {});
        }
      } catch {}
    } catch (err: any) {
      console.error('communityApi.deleteMessage error:', err);
      throw err;
    }
  },

  /**
   * Subscribe to new real-time community chat messages
   */
  subscribeToMessages: (
    onNewMessage: (msg: CommunityMessage) => void,
    onDeleteMessage?: (msgId: string) => void
  ): (() => void) => {
    try {
      if (!insforge.realtime) {
        return () => {};
      }

      const channelName = 'community-chat';
      insforge.realtime.subscribe(channelName).catch(() => {});

      const newMsgHandler = (event: any) => {
        const payload = event?.payload || event?.data || event;
        if (payload && (payload.id || payload.message)) {
          onNewMessage(payload as CommunityMessage);
        }
      };

      const deleteMsgHandler = (event: any) => {
        const payload = event?.payload || event?.data || event;
        if (payload?.id && onDeleteMessage) {
          onDeleteMessage(payload.id);
        }
      };

      insforge.realtime.on('new_message', newMsgHandler);
      if (onDeleteMessage) {
        insforge.realtime.on('delete_message', deleteMsgHandler);
      }

      return () => {
        try {
          insforge.realtime.off('new_message', newMsgHandler);
          if (onDeleteMessage) {
            insforge.realtime.off('delete_message', deleteMsgHandler);
          }
          insforge.realtime.unsubscribe(channelName);
        } catch {}
      };
    } catch (err) {
      console.warn('Realtime subscription not available; running in database mode.');
      return () => {};
    }
  },

  /**
   * Alias for subscribeToMessages
   */
  subscribe: (
    onNewMessage: (msg: CommunityMessage) => void,
    onDeleteMessage?: (msgId: string) => void
  ): (() => void) => {
    return communityApi.subscribeToMessages(onNewMessage, onDeleteMessage);
  },
};
