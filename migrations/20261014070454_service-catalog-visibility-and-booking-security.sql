-- Service catalog, persisted visibility, and authenticated RPCs.
-- Existing PG tables, routes, functions, and booking behavior are unchanged.

CREATE TABLE IF NOT EXISTS public.service_experience_settings (
  id TEXT PRIMARY KEY CHECK (id = 'global'),
  old_meals_enabled BOOLEAN NOT NULL DEFAULT true,
  new_meals_enabled BOOLEAN NOT NULL DEFAULT true,
  old_laundry_enabled BOOLEAN NOT NULL DEFAULT true,
  new_laundry_enabled BOOLEAN NOT NULL DEFAULT true,
  extra_services_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.service_experience_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.meal_service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(16) NOT NULL CHECK (category IN ('veg', 'non_veg', 'both')),
  billing_period VARCHAR(16) NOT NULL CHECK (billing_period IN ('daily', 'monthly')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  meals_included TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  availability_note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.laundry_service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  billing_period VARCHAR(16) NOT NULL CHECK (billing_period IN ('per_kg', 'monthly', 'per_item')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  services_included TEXT[] NOT NULL DEFAULT '{}',
  turnaround_time VARCHAR(120) NOT NULL DEFAULT '',
  pickup_available BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  availability_note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_service_plans_visibility
  ON public.meal_service_plans (is_active, is_available, sort_order);
CREATE INDEX IF NOT EXISTS idx_laundry_service_plans_visibility
  ON public.laundry_service_plans (is_active, is_available, sort_order);

ALTER TABLE public.meal_service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_experience_settings ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.meal_service_plans, public.laundry_service_plans,
  public.service_experience_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.meal_service_plans,
  public.laundry_service_plans TO authenticated;
GRANT UPDATE ON public.service_experience_settings TO authenticated;

DROP POLICY IF EXISTS "Customers read available meal plans" ON public.meal_service_plans;
DROP POLICY IF EXISTS "Admins manage meal plans" ON public.meal_service_plans;
CREATE POLICY "Customers read available meal plans" ON public.meal_service_plans
  FOR SELECT USING (
    (is_active AND is_available AND EXISTS (
      SELECT 1 FROM public.service_experience_settings s
      WHERE s.id = 'global' AND s.new_meals_enabled
    )) OR public.has_admin_permission('meals')
  );
CREATE POLICY "Admins manage meal plans" ON public.meal_service_plans
  FOR ALL USING (public.has_admin_permission('meals'))
  WITH CHECK (public.has_admin_permission('meals'));

DROP POLICY IF EXISTS "Customers read available laundry plans" ON public.laundry_service_plans;
DROP POLICY IF EXISTS "Admins manage laundry plans" ON public.laundry_service_plans;
CREATE POLICY "Customers read available laundry plans" ON public.laundry_service_plans
  FOR SELECT USING (
    (is_active AND is_available AND EXISTS (
      SELECT 1 FROM public.service_experience_settings s
      WHERE s.id = 'global' AND s.new_laundry_enabled
    )) OR public.has_admin_permission('laundry')
  );
CREATE POLICY "Admins manage laundry plans" ON public.laundry_service_plans
  FOR ALL USING (public.has_admin_permission('laundry'))
  WITH CHECK (public.has_admin_permission('laundry'));

DROP POLICY IF EXISTS "Public read service experience settings" ON public.service_experience_settings;
DROP POLICY IF EXISTS "Admins update service experience settings" ON public.service_experience_settings;
CREATE POLICY "Public read service experience settings" ON public.service_experience_settings
  FOR SELECT USING (id = 'global');
CREATE POLICY "Admins update service experience settings" ON public.service_experience_settings
  FOR UPDATE USING (public.has_admin_permission('settings'))
  WITH CHECK (public.has_admin_permission('settings'));

-- These are the exact plan values requested by the owner. They are editable
-- catalog rows, not provider, customer, or booking/demo records.
INSERT INTO public.meal_service_plans
  (code, name, category, billing_period, price, description, meals_included, features, sort_order)
VALUES
  ('MEAL-BASIC', 'Basic Plan', 'veg', 'monthly', 3500,
   'A practical monthly vegetarian meal plan for everyday student dining.',
   ARRAY['Lunch', 'Dinner'], ARRAY['Monthly billing', 'Vegetarian meals'], 10),
  ('MEAL-STANDARD', 'Standard Plan', 'both', 'monthly', 4500,
   'A balanced monthly meal plan with vegetarian and non-vegetarian choices.',
   ARRAY['Breakfast', 'Lunch', 'Dinner'], ARRAY['Monthly billing', 'Veg and non-veg choices'], 20),
  ('MEAL-PREMIUM', 'Premium Plan', 'both', 'monthly', 6000,
   'A premium monthly meal plan with a wider daily meal selection.',
   ARRAY['Breakfast', 'Lunch', 'Dinner'], ARRAY['Monthly billing', 'Premium menu selection'], 30),
  ('MEAL-NONVEG-DELIGHT', 'Non-Veg Delight', 'non_veg', 'monthly', 5500,
   'A monthly plan centered on non-vegetarian meal options.',
   ARRAY['Lunch', 'Dinner'], ARRAY['Monthly billing', 'Non-veg menu options'], 40),
  ('MEAL-DAILY-VEG', 'Daily Veg Meal', 'veg', 'daily', 150,
   'A daily vegetarian meal option, billed by the number of days selected.',
   ARRAY['One vegetarian meal per day'], ARRAY['Daily billing', 'Vegetarian'], 50),
  ('MEAL-BREAKFAST-SPECIAL', 'Breakfast Special', 'veg', 'monthly', 1500,
   'A monthly vegetarian breakfast plan.',
   ARRAY['Breakfast'], ARRAY['Monthly billing', 'Vegetarian breakfast'], 60)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.laundry_service_plans
  (code, name, billing_period, price, description, services_included,
   turnaround_time, pickup_available, sort_order)
VALUES
  ('LAUNDRY-PER-KG', 'Per-KG Plan', 'per_kg', 40,
   'Laundry priced by the submitted weight.', ARRAY['Wash', 'Dry', 'Iron'], '24–48 hours', true, 10),
  ('LAUNDRY-MONTHLY-UNLIMITED', 'Monthly Unlimited', 'monthly', 1200,
   'Monthly laundry service. Pickup schedule is controlled by the admin.',
   ARRAY['Monthly laundry service'], 'Pickup schedule managed by admin', true, 20),
  ('LAUNDRY-PREMIUM-CARE', 'Premium Care', 'per_item', 80,
   'Special handling for delicate garments, priced per item.',
   ARRAY['Delicate-fabric care'], '48 hours', true, 30)
ON CONFLICT (code) DO NOTHING;

-- Authenticated booking RPC: derives profile, type, availability, and amount
-- from the current JWT and database. It only inserts non-PG service bookings.
CREATE OR REPLACE FUNCTION public.create_service_booking(
  p_catalog_type TEXT,
  p_booking_date TIMESTAMPTZ,
  p_address TEXT,
  p_catalog_id UUID DEFAULT NULL,
  p_duration INTEGER DEFAULT 1,
  p_quantity NUMERIC DEFAULT 1,
  p_scheduled_time TEXT DEFAULT NULL,
  p_details TEXT DEFAULT '',
  p_custom_service_name TEXT DEFAULT '',
  p_billing_period TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_enabled BOOLEAN;
  v_name TEXT;
  v_period TEXT;
  v_unit_price NUMERIC(10, 2);
  v_amount NUMERIC(10, 2);
  v_booking_type TEXT;
  v_service_id UUID;
  v_booking_number TEXT;
  v_booking public.bookings%ROWTYPE;
  v_plan RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_booking_date IS NULL OR COALESCE(length(trim(p_address)), 0) < 5 THEN
    RAISE EXCEPTION 'A valid pickup/service date and address are required';
  END IF;
  IF COALESCE(p_duration, 0) < 1 OR COALESCE(p_duration, 0) > 365
     OR COALESCE(p_quantity, 0) <= 0 OR p_quantity > 1000 THEN
    RAISE EXCEPTION 'Invalid duration or service quantity';
  END IF;

  SELECT u.id, lower(u.role) INTO v_user_id, v_role
  FROM public.users u
  WHERE u.auth_user_id = auth.uid() AND u.is_active = true
  LIMIT 1;
  IF v_user_id IS NULL OR v_role NOT IN ('customer') THEN
    RAISE EXCEPTION 'An active customer profile is required';
  END IF;

  CASE p_catalog_type
    WHEN 'meal_plan' THEN
      SELECT p.name, p.billing_period, p.price, p.is_active, p.is_available
      INTO v_plan
      FROM public.meal_service_plans p WHERE p.id = p_catalog_id;
      SELECT s.new_meals_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_booking_type := 'MEAL';

    WHEN 'legacy_meal_provider' THEN
      SELECT p.name,
        CASE WHEN p_billing_period = 'monthly' THEN 'monthly' ELSE 'daily' END AS billing_period,
        CASE WHEN p_billing_period = 'monthly' THEN p.monthly_price ELSE p.daily_price END AS price,
        p.is_active, p.status
      INTO v_plan
      FROM public.meal_providers p WHERE p.id = p_catalog_id;
      SELECT s.old_meals_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_booking_type := 'MEAL';

    WHEN 'laundry_plan' THEN
      SELECT p.name, p.billing_period, p.price, p.is_active, p.is_available, p.pickup_available
      INTO v_plan
      FROM public.laundry_service_plans p WHERE p.id = p_catalog_id;
      SELECT s.new_laundry_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_booking_type := 'LAUNDRY';

    WHEN 'legacy_laundry_provider' THEN
      SELECT p.name, p.is_active, p.pickup_available,
        COALESCE(NULLIF(p.pricing->>'perKg', '')::NUMERIC,
          NULLIF(p.pricing->>'pricePerKg', '')::NUMERIC,
          NULLIF(p.pricing->>'startingPrice', '')::NUMERIC, 0) AS price
      INTO v_plan
      FROM public.laundry_providers p WHERE p.id = p_catalog_id;
      SELECT s.old_laundry_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_booking_type := 'LAUNDRY';

    WHEN 'service' THEN
      SELECT p.name, 'per_item' AS billing_period, p.starting_price AS price, p.is_active
      INTO v_plan FROM public.services p WHERE p.id = p_catalog_id;
      SELECT s.extra_services_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_booking_type := 'SERVICE';
      v_service_id := p_catalog_id;

    WHEN 'custom_service' THEN
      SELECT s.extra_services_enabled INTO v_enabled
      FROM public.service_experience_settings s WHERE s.id = 'global';
      v_name := trim(COALESCE(p_custom_service_name, ''));
      IF v_name = '' THEN RAISE EXCEPTION 'Describe the custom service requested'; END IF;
      v_period := 'per_item';
      v_unit_price := 0;
      v_booking_type := 'SERVICE';

    ELSE
      RAISE EXCEPTION 'Unsupported service catalog type';
  END CASE;

  IF NOT COALESCE(v_enabled, false) THEN
    RAISE EXCEPTION 'This service experience is currently disabled';
  END IF;

  IF p_catalog_type <> 'custom_service' THEN
    IF v_plan.name IS NULL OR NOT COALESCE(v_plan.is_active, false) THEN
      RAISE EXCEPTION 'Selected service is unavailable';
    END IF;
    IF p_catalog_type IN ('meal_plan', 'laundry_plan')
       AND NOT COALESCE(v_plan.is_available, false) THEN
      RAISE EXCEPTION 'Selected plan is not currently available';
    END IF;
    IF p_catalog_type IN ('legacy_meal_provider', 'legacy_laundry_provider')
       AND v_plan.status <> 'active' THEN
      RAISE EXCEPTION 'Selected legacy provider is unavailable';
    END IF;
    IF p_catalog_type IN ('legacy_laundry_provider', 'laundry_plan')
       AND NOT COALESCE(v_plan.pickup_available, true) THEN
      RAISE EXCEPTION 'Pickup is not currently available for this plan';
    END IF;
    v_name := v_plan.name;
    IF p_catalog_type IN ('meal_plan', 'laundry_plan', 'legacy_meal_provider', 'service') THEN
      v_period := v_plan.billing_period;
    ELSIF p_catalog_type = 'legacy_laundry_provider' THEN
      v_period := 'per_kg';
    ELSE
      v_period := 'per_item';
    END IF;
    v_unit_price := COALESCE(v_plan.price, 0);
  END IF;

  IF v_period IN ('daily', 'monthly') THEN
    v_amount := round(v_unit_price * p_duration, 2);
  ELSE
    v_amount := round(v_unit_price * p_quantity, 2);
  END IF;

  v_booking_number := 'EHB-' || to_char(now() AT TIME ZONE 'UTC', 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 8));

  INSERT INTO public.bookings (
    booking_number, user_id, service_id, booking_type, status,
    scheduled_date, scheduled_time, address, notes, amount
  ) VALUES (
    v_booking_number, v_user_id, v_service_id, v_booking_type, 'PENDING',
    p_booking_date, NULLIF(trim(COALESCE(p_scheduled_time, '')), ''), trim(p_address),
    jsonb_build_object(
      'source', 'easehub_service_catalog',
      'catalogType', p_catalog_type,
      'catalogId', p_catalog_id,
      'serviceName', v_name,
      'billingPeriod', v_period,
      'unitPrice', v_unit_price,
      'duration', p_duration,
      'quantity', p_quantity,
      'details', COALESCE(p_details, ''),
      'customServiceName', CASE WHEN p_catalog_type = 'custom_service' THEN v_name ELSE NULL END
    )::TEXT,
    v_amount
  ) RETURNING * INTO v_booking;

  RETURN to_jsonb(v_booking);
END;
$$;

REVOKE ALL ON FUNCTION public.create_service_booking(
  TEXT, TIMESTAMPTZ, TEXT, UUID, INTEGER, NUMERIC, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_service_booking(
  TEXT, TIMESTAMPTZ, TEXT, UUID, INTEGER, NUMERIC, TEXT, TEXT, TEXT, TEXT
) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_service_booking_status(
  p_booking_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_old_status TEXT;
  v_new_status TEXT := upper(trim(COALESCE(p_status, '')));
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_admin_permission('bookings') THEN
    RAISE EXCEPTION 'Bookings admin permission required';
  END IF;
  IF v_new_status NOT IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') THEN
    RAISE EXCEPTION 'Invalid booking lifecycle status';
  END IF;

  SELECT * INTO v_booking FROM public.bookings b
  WHERE b.id = p_booking_id AND b.booking_type <> 'PG';
  IF v_booking.id IS NULL THEN RAISE EXCEPTION 'Service booking not found'; END IF;
  v_old_status := upper(v_booking.status);

  IF v_old_status = v_new_status THEN RETURN to_jsonb(v_booking); END IF;
  IF v_old_status IN ('COMPLETED', 'CANCELLED', 'REJECTED')
    OR (v_old_status = 'PENDING' AND v_new_status NOT IN ('CONFIRMED', 'CANCELLED', 'REJECTED'))
    OR (v_old_status = 'CONFIRMED' AND v_new_status NOT IN ('ASSIGNED', 'IN_PROGRESS', 'CANCELLED', 'REJECTED'))
    OR (v_old_status = 'ASSIGNED' AND v_new_status NOT IN ('IN_PROGRESS', 'CANCELLED', 'REJECTED'))
    OR (v_old_status = 'IN_PROGRESS' AND v_new_status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED')) THEN
    RAISE EXCEPTION 'Invalid service booking status transition: % to %', v_old_status, v_new_status;
  END IF;

  UPDATE public.bookings b SET status = v_new_status, updated_at = NOW()
  WHERE b.id = p_booking_id RETURNING * INTO v_booking;
  RETURN to_jsonb(v_booking);
END;
$$;

REVOKE ALL ON FUNCTION public.update_service_booking_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_service_booking_status(UUID, TEXT) TO authenticated;

-- Payment proof RPC always copies amount/user from the selected existing booking.
CREATE OR REPLACE FUNCTION public.submit_service_payment_proof(
  p_booking_id UUID,
  p_utr TEXT,
  p_screenshot_url TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_booking public.bookings%ROWTYPE;
  v_payment public.payments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR COALESCE(length(trim(p_utr)), 0) < 6 THEN
    RAISE EXCEPTION 'Authentication and a valid UTR are required';
  END IF;
  SELECT u.id INTO v_user_id FROM public.users u
  WHERE u.auth_user_id = auth.uid() AND u.is_active = true AND lower(u.role) = 'customer'
  LIMIT 1;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Active customer profile required'; END IF;

  SELECT * INTO v_booking FROM public.bookings b
  WHERE b.id = p_booking_id AND b.user_id = v_user_id AND b.booking_type <> 'PG';
  IF v_booking.id IS NULL THEN RAISE EXCEPTION 'Service booking was not found'; END IF;

  SELECT * INTO v_payment FROM public.payments p
  WHERE p.booking_id = v_booking.id
  ORDER BY p.created_at DESC LIMIT 1;

  IF v_payment.id IS NOT NULL THEN
    IF v_payment.status NOT IN ('VERIFICATION_PENDING', 'REJECTED') THEN
      RAISE EXCEPTION 'Payment proof can no longer be changed';
    END IF;
    UPDATE public.payments SET
      amount = v_booking.amount,
      user_id = v_user_id,
      payment_method = 'qr',
      status = 'VERIFICATION_PENDING',
      utr = trim(p_utr),
      screenshot_url = COALESCE(p_screenshot_url, ''),
      verified_by = NULL,
      verified_at = NULL,
      rejection_reason = NULL,
      updated_at = NOW()
    WHERE id = v_payment.id RETURNING * INTO v_payment;
  ELSE
    INSERT INTO public.payments (
      booking_id, user_id, amount, payment_method, status, utr, screenshot_url
    ) VALUES (
      v_booking.id, v_user_id, v_booking.amount, 'qr', 'VERIFICATION_PENDING',
      trim(p_utr), COALESCE(p_screenshot_url, '')
    ) RETURNING * INTO v_payment;
  END IF;

  RETURN to_jsonb(v_payment);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_service_payment_proof(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_service_payment_proof(UUID, TEXT, TEXT) TO authenticated;
