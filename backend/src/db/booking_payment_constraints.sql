-- Apply through the InsForge migration workflow after reviewing existing duplicates.
-- These constraints make retries idempotent for active booking/payment lifecycles.

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_duplicate_guard
ON public.bookings (
  user_id,
  booking_type,
  COALESCE(service_id, '00000000-0000-0000-0000-000000000000'::uuid),
  scheduled_date,
  amount
)
WHERE status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS');

CREATE UNIQUE INDEX IF NOT EXISTS payments_active_booking_guard
ON public.payments (booking_id)
WHERE status <> 'REJECTED';
