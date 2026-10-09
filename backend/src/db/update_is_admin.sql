CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'superadmin')
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE email = COALESCE(auth.jwt() ->> 'email', '')
      AND role IN ('admin', 'superadmin')
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'superadmin'))
    OR
    (auth.jwt() ->> 'role' IN ('admin', 'superadmin', 'service_role'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
