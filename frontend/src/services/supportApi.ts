import { insforge } from './insforge';

export interface SupportConversation {
  id: string;
  user_id: string;
  status: 'OPEN' | 'CLOSED';
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  lastMessage?: string;
  last_message?: string;
  last_message_at?: string;
  unreadCount?: number;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  updated_at?: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  status?: 'sending' | 'sent' | 'failed';
  error?: string;
}

export const supportApi = {
  /**
   * Get or create a customer's active support conversation
   */
  getOrCreateUserConversation: async (userId: string): Promise<SupportConversation> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // 1. Try to find existing conversation
      const { data: existing, error: searchError } = await insforge.database
        .from('support_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (searchError) {
        console.error('Error finding user support conversation:', searchError);
        throw new Error(searchError.message);
      }

      let convRow: any = null;
      if (existing && existing.length > 0) {
        const openConv = existing.find((c: any) => c.status === 'OPEN');
        convRow = openConv || existing[0];
      } else {
        // Create new conversation
        const { data: created, error: createError } = await insforge.database
          .from('support_conversations')
          .insert([
            {
              user_id: userId,
              status: 'OPEN',
            },
          ])
          .select('*');

        if (createError || !created || created.length === 0) {
          console.error('Error creating support conversation:', createError);
          throw new Error(createError?.message || 'Failed to create support conversation');
        }
        convRow = created[0];
      }

      // Fetch user profile
      const { data: userData } = await insforge.database
        .from('users')
        .select('id, name, email, phone, avatar_url, role')
        .eq('id', userId);

      if (userData && userData.length > 0) {
        convRow.user = userData[0];
      }

      return convRow as SupportConversation;
    } catch (err: any) {
      console.error('supportApi.getOrCreateUserConversation error:', err);
      throw err;
    }
  },

  /**
   * Fetch all messages in a specific conversation
   */
  getConversationMessages: async (conversationId: string): Promise<SupportMessage[]> => {
    try {
      const { data: rawMessages, error } = await insforge.database
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error || !Array.isArray(rawMessages)) {
        console.error('Error fetching support messages:', error);
        return [];
      }

      if (rawMessages.length === 0) return [];

      // Collect senders
      const senderIds = Array.from(new Set(rawMessages.map((m: any) => m.sender_id).filter(Boolean)));
      let senderMap: Record<string, any> = {};
      if (senderIds.length > 0) {
        const { data: senders } = await insforge.database
          .from('users')
          .select('id, name, avatar_url, role')
          .in('id', senderIds);
        if (Array.isArray(senders)) {
          senders.forEach((s: any) => {
            senderMap[s.id] = s;
          });
        }
      }

      return rawMessages.map((m: any) => ({
        ...m,
        sender: senderMap[m.sender_id] || null,
        status: 'sent',
      }));
    } catch (err: any) {
      console.error('supportApi.getConversationMessages error:', err);
      return [];
    }
  },

  /**
   * Send a support message
   */
  sendMessage: async (
    conversationId: string,
    senderId: string,
    messageText: string,
    isAdminReply: boolean = false
  ): Promise<SupportMessage> => {
    if (!messageText.trim()) {
      throw new Error('Message cannot be empty');
    }
    if (!conversationId || !senderId) {
      throw new Error('Conversation ID and Sender ID are required');
    }

    try {
      const { data, error } = await insforge.database
        .from('support_messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            message: messageText.trim(),
            is_admin_reply: isAdminReply,
          },
        ])
        .select('*');

      if (error || !data || data.length === 0) {
        console.error('Error inserting support message:', error);
        throw new Error(error?.message || 'Failed to send message');
      }

      const created = data[0] as SupportMessage;

      // Attach sender info
      const { data: senderProfiles } = await insforge.database
        .from('users')
        .select('id, name, avatar_url, role')
        .eq('id', senderId);

      if (senderProfiles && senderProfiles.length > 0) {
        created.sender = senderProfiles[0];
      }
      created.status = 'sent';

      // Update conversation updated_at
      await insforge.database
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Broadcast over Realtime if available
      try {
        if (insforge.realtime) {
          insforge.realtime
            .publish(`support-${conversationId}`, 'new_support_message', created)
            .catch(() => {});
          insforge.realtime
            .publish('support-admin-global', 'support_conversation_updated', {
              conversationId,
              message: created,
            })
            .catch(() => {});
        }
      } catch {}

      return created;
    } catch (err: any) {
      console.error('supportApi.sendMessage error:', err);
      throw err;
    }
  },

  /**
   * Admin: Fetch all customer support conversations
   */
  getAllConversations: async (): Promise<SupportConversation[]> => {
    try {
      const { data: rawConversations, error } = await insforge.database
        .from('support_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !Array.isArray(rawConversations)) {
        console.error('Error fetching admin support conversations:', error);
        return [];
      }

      if (rawConversations.length === 0) return [];

      const userIds = Array.from(new Set(rawConversations.map((c: any) => c.user_id).filter(Boolean)));
      let userMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await insforge.database
          .from('users')
          .select('id, name, email, phone, avatar_url, role')
          .in('id', userIds);
        if (Array.isArray(usersData)) {
          usersData.forEach((u: any) => {
            userMap[u.id] = u;
          });
        }
      }

      return rawConversations.map((c: any) => ({
        ...c,
        user: userMap[c.user_id] || null,
      }));
    } catch (err: any) {
      console.error('supportApi.getAllConversations error:', err);
      return [];
    }
  },

  /**
   * Admin: Close or reopen a support conversation
   */
  updateConversationStatus: async (
    conversationId: string,
    status: 'OPEN' | 'CLOSED'
  ): Promise<void> => {
    try {
      const { error } = await insforge.database
        .from('support_conversations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error('supportApi.updateConversationStatus error:', err);
      throw err;
    }
  },

  /**
   * Subscribe to messages in a specific conversation
   */
  subscribeToConversation: (
    conversationId: string,
    onMessage: (msg: SupportMessage) => void,
    onStatusChange?: (status: 'OPEN' | 'CLOSED') => void
  ): (() => void) => {
    try {
      if (!insforge.realtime) return () => {};

      const channelName = `support-${conversationId}`;
      insforge.realtime.subscribe(channelName).catch(() => {});

      const msgHandler = (event: any) => {
        const payload = event?.payload || event?.data || event;
        if (payload && (payload.id || payload.message)) {
          onMessage(payload as SupportMessage);
        }
      };

      const statusHandler = (event: any) => {
        const payload = event?.payload || event?.data || event;
        if (payload?.status && onStatusChange) {
          onStatusChange(payload.status);
        }
      };

      insforge.realtime.on('new_support_message', msgHandler);
      if (onStatusChange) {
        insforge.realtime.on('support_status_changed', statusHandler);
      }

      return () => {
        try {
          insforge.realtime.off('new_support_message', msgHandler);
          if (onStatusChange) {
            insforge.realtime.off('support_status_changed', statusHandler);
          }
          insforge.realtime.unsubscribe(channelName);
        } catch {}
      };
    } catch (err) {
      console.warn('Realtime support subscription unavailable');
      return () => {};
    }
  },

  /**
   * Alias for subscribeToConversation
   */
  subscribe: (
    conversationId: string,
    onMessage: (msg: SupportMessage) => void,
    onStatusChange?: (status: 'OPEN' | 'CLOSED') => void
  ): (() => void) => {
    return supportApi.subscribeToConversation(conversationId, onMessage, onStatusChange);
  },
};
