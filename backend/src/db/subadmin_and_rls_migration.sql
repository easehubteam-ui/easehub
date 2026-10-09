-- EaseHub Sub-Admin Permission System & Community Chat RLS Migration

-- 1. Add permissions JSONB column to public.users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Update role check constraint if present to support superadmin, subadmin, admin, vendor, customer
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public' AND t.relname = 'users' AND c.contype = 'c'
  ) LOOP
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 3. Core Role & Permission Helper Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.is_active = true
      AND LOWER(u.role) IN ('superadmin', 'super_admin')
      AND (
        (auth.uid() IS NOT NULL AND u.auth_user_id = auth.uid())
        OR (
          COALESCE(auth.jwt() ->> 'email', '') <> ''
          AND LOWER(u.email) = LOWER(auth.jwt() ->> 'email')
        )
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.is_active = true
      AND LOWER(u.role) IN ('superadmin', 'super_admin', 'subadmin', 'sub_admin', 'admin')
      AND (
        (auth.uid() IS NOT NULL AND u.auth_user_id = auth.uid())
        OR (
          COALESCE(auth.jwt() ->> 'email', '') <> ''
          AND LOWER(u.email) = LOWER(auth.jwt() ->> 'email')
        )
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_admin_permission(perm_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_perms JSONB;
BEGIN
  IF public.is_super_admin() THEN
    RETURN true;
  END IF;

  SELECT LOWER(u.role), COALESCE(u.permissions, '{}'::jsonb)
  INTO v_role, v_perms
  FROM public.users u
  WHERE u.is_active = true
    AND LOWER(u.role) IN ('subadmin', 'sub_admin', 'admin')
    AND (
      (auth.uid() IS NOT NULL AND u.auth_user_id = auth.uid())
      OR (
        COALESCE(auth.jwt() ->> 'email', '') <> ''
        AND LOWER(u.email) = LOWER(auth.jwt() ->> 'email')
      )
    )
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Never allow subadmin to have subadmins management permission
  IF LOWER(perm_key) = 'subadmins' THEN
    RETURN false;
  END IF;

  RETURN COALESCE((v_perms ->> perm_key)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Trigger to protect role & permissions escalation on public.users
CREATE OR REPLACE FUNCTION public.enforce_user_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow direct postgres / migration / service role operations when auth.uid() is null and jwt is empty
  IF auth.uid() IS NULL AND COALESCE(auth.jwt() ->> 'role', '') IN ('', 'service_role') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Super Admin has full control (except deleting the last superadmin)
  IF public.is_super_admin() THEN
    IF TG_OP = 'DELETE' AND LOWER(OLD.role) IN ('superadmin', 'super_admin') THEN
      IF (SELECT COUNT(*) FROM public.users WHERE LOWER(role) IN ('superadmin', 'super_admin') AND id <> OLD.id) = 0 THEN
        RAISE EXCEPTION 'Cannot delete the final Super Admin account.';
      END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF LOWER(COALESCE(NEW.role, 'customer')) NOT IN ('customer') THEN
      RAISE EXCEPTION 'Only Super Admin can create administrator accounts.';
    END IF;
    NEW.permissions := '{}'::jsonb;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Prevent anyone other than Super Admin from modifying a Super Admin or Sub Admin account's role/permissions
    IF LOWER(OLD.role) IN ('superadmin', 'super_admin') THEN
      RAISE EXCEPTION 'Only Super Admin can modify a Super Admin account.';
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Only Super Admin can change user roles.';
    END IF;

    IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
      RAISE EXCEPTION 'Only Super Admin can modify permissions.';
    END IF;

    -- If updating another user, require 'users' permission and target must not be an admin
    IF OLD.auth_user_id IS DISTINCT FROM auth.uid() THEN
      IF NOT public.has_admin_permission('users') THEN
        RAISE EXCEPTION 'Insufficient permissions to modify users.';
      END IF;
      IF LOWER(OLD.role) IN ('subadmin', 'sub_admin', 'admin') THEN
        RAISE EXCEPTION 'Only Super Admin can modify Sub Admin accounts.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF LOWER(OLD.role) IN ('superadmin', 'super_admin', 'subadmin', 'sub_admin', 'admin') THEN
      RAISE EXCEPTION 'Only Super Admin can delete administrator accounts.';
    END IF;
    IF NOT public.has_admin_permission('users') THEN
      RAISE EXCEPTION 'Insufficient permissions to delete users.';
    END IF;
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_user_security ON public.users;
CREATE TRIGGER trg_enforce_user_security
BEFORE INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_user_security();

-- 5. Update RLS Policies across all tables to enforce module-level permissions

-- USERS
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins full access on users" ON public.users;
DROP POLICY IF EXISTS "Authenticated read basic user info" ON public.users;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (
    auth.uid() IS NOT NULL OR public.is_admin()
  );

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (
    (auth_user_id = auth.uid() AND LOWER(role) = 'customer')
    OR public.is_super_admin()
  );

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR public.is_super_admin()
    OR (public.has_admin_permission('users') AND LOWER(role) NOT IN ('superadmin', 'super_admin', 'subadmin', 'sub_admin', 'admin'))
  );

CREATE POLICY "Admins full access on users" ON public.users
  FOR ALL USING (
    public.is_super_admin()
  );

-- COMMUNITY MESSAGES
DROP POLICY IF EXISTS "Read non-deleted community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can insert own community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Admins manage community messages" ON public.community_messages;

CREATE POLICY "Read non-deleted community messages" ON public.community_messages
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND is_deleted = false)
    OR public.has_admin_permission('community')
  );

CREATE POLICY "Users can insert own community messages" ON public.community_messages
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE is_active = true
        AND (
          auth_user_id = auth.uid()
          OR (COALESCE(auth.jwt() ->> 'email', '') <> '' AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
        )
    )
    OR public.has_admin_permission('community')
  );

CREATE POLICY "Admins manage community messages" ON public.community_messages
  FOR ALL USING (public.has_admin_permission('community'));

-- SUPPORT CONVERSATIONS & MESSAGES
DROP POLICY IF EXISTS "Users can read own support conversations" ON public.support_conversations;
DROP POLICY IF EXISTS "Users can create own support conversations" ON public.support_conversations;
DROP POLICY IF EXISTS "Admins manage support conversations" ON public.support_conversations;

CREATE POLICY "Users can read own support conversations" ON public.support_conversations
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('support')
  );

CREATE POLICY "Users can create own support conversations" ON public.support_conversations
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('support')
  );

CREATE POLICY "Admins manage support conversations" ON public.support_conversations
  FOR ALL USING (public.has_admin_permission('support'));

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.support_messages;
DROP POLICY IF EXISTS "Users and admins can insert messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins manage support messages" ON public.support_messages;

CREATE POLICY "Users can read messages in their conversations" ON public.support_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.support_conversations
      WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
    OR public.has_admin_permission('support')
  );

CREATE POLICY "Users and admins can insert messages" ON public.support_messages
  FOR INSERT WITH CHECK (
    (
      sender_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      AND conversation_id IN (
        SELECT id FROM public.support_conversations
        WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      )
    )
    OR public.has_admin_permission('support')
  );

CREATE POLICY "Admins manage support messages" ON public.support_messages
  FOR ALL USING (public.has_admin_permission('support'));

-- PGS
DROP POLICY IF EXISTS "Public read active PGs" ON public.pgs;
DROP POLICY IF EXISTS "Admins manage PGs" ON public.pgs;

CREATE POLICY "Public read active PGs" ON public.pgs
  FOR SELECT USING (is_active = true OR public.has_admin_permission('pg'));

CREATE POLICY "Admins manage PGs" ON public.pgs
  FOR ALL USING (public.has_admin_permission('pg'));

-- MEAL PROVIDERS
DROP POLICY IF EXISTS "Public read active Meal Providers" ON public.meal_providers;
DROP POLICY IF EXISTS "Admins manage Meal Providers" ON public.meal_providers;

CREATE POLICY "Public read active Meal Providers" ON public.meal_providers
  FOR SELECT USING (is_active = true OR public.has_admin_permission('meals'));

CREATE POLICY "Admins manage Meal Providers" ON public.meal_providers
  FOR ALL USING (public.has_admin_permission('meals'));

-- LAUNDRY PROVIDERS
DROP POLICY IF EXISTS "Public read active Laundry Providers" ON public.laundry_providers;
DROP POLICY IF EXISTS "Admins manage Laundry Providers" ON public.laundry_providers;

CREATE POLICY "Public read active Laundry Providers" ON public.laundry_providers
  FOR SELECT USING (is_active = true OR public.has_admin_permission('laundry'));

CREATE POLICY "Admins manage Laundry Providers" ON public.laundry_providers
  FOR ALL USING (public.has_admin_permission('laundry'));

-- SERVICES
DROP POLICY IF EXISTS "Public read active Services" ON public.services;
DROP POLICY IF EXISTS "Admins manage Services" ON public.services;

CREATE POLICY "Public read active Services" ON public.services
  FOR SELECT USING (is_active = true OR public.has_admin_permission('services'));

CREATE POLICY "Admins manage Services" ON public.services
  FOR ALL USING (public.has_admin_permission('services'));

-- BOOKINGS
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;

CREATE POLICY "Users can read own bookings" ON public.bookings
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('bookings')
    OR public.has_admin_permission('dashboard')
    OR public.has_admin_permission('reports')
  );

CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('bookings')
  );

CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL USING (public.has_admin_permission('bookings'));

-- PAYMENTS
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;

CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('payments')
    OR public.has_admin_permission('reports')
  );

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('payments')
  );

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (public.has_admin_permission('payments'));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('notifications')
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('notifications')
  );

CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL USING (public.has_admin_permission('notifications'));

-- REVIEWS
DROP POLICY IF EXISTS "Public read published reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own review" ON public.reviews;
DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;

CREATE POLICY "Public read published reviews" ON public.reviews
  FOR SELECT USING (is_published = true OR public.has_admin_permission('reviews'));

CREATE POLICY "Users can insert own review" ON public.reviews
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_admin_permission('reviews')
  );

CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (public.has_admin_permission('reviews'));

-- 6. Automatically link public.users.auth_user_id and verify email in auth.users
CREATE OR REPLACE FUNCTION public.auto_verify_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_verified := true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_verify_auth_user ON auth.users;
CREATE TRIGGER trg_auto_verify_auth_user
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_verify_auth_user();

CREATE OR REPLACE FUNCTION public.sync_user_auth_link()
RETURNS TRIGGER AS $$
DECLARE
  v_auth_id UUID;
BEGIN
  IF NEW.email IS NOT NULL THEN
    SELECT id INTO v_auth_id FROM auth.users WHERE LOWER(email) = LOWER(NEW.email) LIMIT 1;
    IF v_auth_id IS NOT NULL THEN
      IF NEW.auth_user_id IS NULL THEN
        NEW.auth_user_id := v_auth_id;
      END IF;
      UPDATE auth.users SET email_verified = true WHERE id = v_auth_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_auth_link ON public.users;
CREATE TRIGGER trg_sync_user_auth_link
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_auth_link();

-- 7. Enable pgcrypto and create SECURITY DEFINER RPCs for reliable Sub Admin management
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.admin_upsert_subadmin(
  p_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_phone TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true,
  p_permissions JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_auth_id UUID;
  v_existing_user public.users%ROWTYPE;
  v_result public.users%ROWTYPE;
  v_perms JSONB;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can create or modify Sub Admin accounts.';
  END IF;

  v_email := LOWER(TRIM(COALESCE(p_email, '')));
  v_name := TRIM(COALESCE(p_name, ''));
  v_phone := NULLIF(TRIM(COALESCE(p_phone, '')), '');

  IF v_email = '' OR v_name = '' THEN
    RAISE EXCEPTION 'Name and email are required.';
  END IF;

  -- Avoid users_phone_key conflict if another user already has this phone number
  IF v_phone IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users WHERE phone = v_phone AND LOWER(email) <> v_email
  ) THEN
    v_phone := NULL;
  END IF;

  -- Check if email belongs to a Super Admin
  SELECT * INTO v_existing_user FROM public.users WHERE LOWER(email) = v_email LIMIT 1;
  IF v_existing_user.id IS NOT NULL AND LOWER(v_existing_user.role) IN ('superadmin', 'super_admin') THEN
    RAISE EXCEPTION 'Cannot convert a Super Admin account into a Sub Admin.';
  END IF;

  -- Upsert into auth.users so Sub Admin can immediately log in with email + password
  SELECT id INTO v_auth_id FROM auth.users WHERE LOWER(email) = v_email LIMIT 1;

  IF v_auth_id IS NULL THEN
    IF COALESCE(LENGTH(p_password), 0) < 6 THEN
      RAISE EXCEPTION 'Password must be at least 6 characters.';
    END IF;

    INSERT INTO auth.users (
      id,
      email,
      password,
      email_verified,
      profile,
      metadata,
      is_project_admin,
      is_anonymous,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_email,
      crypt(p_password, gen_salt('bf', 10)),
      true,
      jsonb_build_object('name', v_name),
      '{}'::jsonb,
      false,
      false,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_auth_id;
  ELSE
    IF COALESCE(LENGTH(p_password), 0) >= 6 THEN
      UPDATE auth.users
      SET password = crypt(p_password, gen_salt('bf', 10)),
          email_verified = true,
          profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object('name', v_name),
          updated_at = NOW()
      WHERE id = v_auth_id;
    ELSE
      UPDATE auth.users
      SET email_verified = true,
          profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object('name', v_name),
          updated_at = NOW()
      WHERE id = v_auth_id;
    END IF;
  END IF;

  v_perms := COALESCE(p_permissions, '{}'::jsonb) - 'subadmins';

  IF v_existing_user.id IS NULL THEN
    INSERT INTO public.users (
      auth_user_id,
      name,
      email,
      phone,
      role,
      is_active,
      permissions,
      created_at,
      updated_at
    ) VALUES (
      v_auth_id,
      v_name,
      v_email,
      v_phone,
      'subadmin',
      COALESCE(p_is_active, true),
      v_perms,
      NOW(),
      NOW()
    )
    RETURNING * INTO v_result;
  ELSE
    UPDATE public.users
    SET auth_user_id = v_auth_id,
        name = v_name,
        phone = COALESCE(v_phone, phone),
        role = 'subadmin',
        is_active = COALESCE(p_is_active, true),
        permissions = v_perms,
        updated_at = NOW()
    WHERE id = v_existing_user.id
    RETURNING * INTO v_result;
  END IF;

  RETURN to_jsonb(v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_get_subadmins()
RETURNS SETOF public.users AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can view Sub Admin accounts.';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.users
  WHERE LOWER(role) IN ('subadmin', 'sub_admin', 'admin')
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';


