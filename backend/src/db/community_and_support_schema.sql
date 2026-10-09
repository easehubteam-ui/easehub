-- EaseHub Community & Support Schema Migration

CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_community_messages_updated_at
BEFORE UPDATE ON community_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_is_deleted ON community_messages(is_deleted);

CREATE TABLE IF NOT EXISTS support_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_support_conversations_updated_at
BEFORE UPDATE ON support_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_support_messages_updated_at
BEFORE UPDATE ON support_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Community Messages RLS
CREATE POLICY "Read non-deleted community messages" ON community_messages
    FOR SELECT USING (((auth.uid() IS NOT NULL) AND (is_deleted = false)) OR is_admin());

CREATE POLICY "Users can insert own community messages" ON community_messages
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Admins manage community messages" ON community_messages
    FOR ALL USING (is_admin());

-- Support Conversations RLS
CREATE POLICY "Users can read own support conversations" ON support_conversations
    FOR SELECT USING (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
    );

CREATE POLICY "Users can create own support conversations" ON support_conversations
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
    );

CREATE POLICY "Admins manage support conversations" ON support_conversations
    FOR ALL USING (is_admin());

-- Support Messages RLS
CREATE POLICY "Users can read messages in their conversations" ON support_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM support_conversations
            WHERE user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
        ) OR is_admin()
    );

CREATE POLICY "Users and admins can insert messages" ON support_messages
    FOR INSERT WITH CHECK (
        (sender_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) AND
         conversation_id IN (
             SELECT id FROM support_conversations
             WHERE user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
         )) OR is_admin()
    );

CREATE POLICY "Admins manage support messages" ON support_messages
    FOR ALL USING (is_admin());
