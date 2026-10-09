-- Harden community_messages SELECT policy to require authenticated session
DROP POLICY IF EXISTS "Read non-deleted community messages" ON community_messages;

CREATE POLICY "Read non-deleted community messages" ON community_messages
    FOR SELECT USING (
        ((auth.uid() IS NOT NULL) AND (is_deleted = false)) OR is_admin()
    );
