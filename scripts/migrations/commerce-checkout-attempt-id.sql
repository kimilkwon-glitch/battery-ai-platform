-- commerce_orders.checkout_attempt_id partial UNIQUE (active unpaid orders only)
--
-- === 적용 전 read-only 중복 검사 ===
-- SELECT checkout_attempt_id, COUNT(*) AS cnt, array_agg(id) AS order_ids
-- FROM commerce_orders
-- WHERE checkout_attempt_id IS NOT NULL
--   AND payment_status IN (
--     'not_started', 'preparing', 'pending', 'processing',
--     'failed', 'canceled', 'reconcile_needed'
--   )
-- GROUP BY checkout_attempt_id
-- HAVING COUNT(*) > 1;
--
-- === 컬럼 (idempotent) ===
ALTER TABLE commerce_orders ADD COLUMN IF NOT EXISTS checkout_attempt_id TEXT;

CREATE INDEX IF NOT EXISTS idx_commerce_orders_checkout_attempt_lookup
  ON commerce_orders (checkout_attempt_id)
  WHERE checkout_attempt_id IS NOT NULL;

-- === Production UNIQUE (트랜잭션 밖, CONCURRENTLY) ===
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commerce_orders_checkout_attempt_active
--   ON commerce_orders (checkout_attempt_id)
--   WHERE checkout_attempt_id IS NOT NULL
--     AND payment_status IN (
--       'not_started', 'preparing', 'pending', 'processing',
--       'failed', 'canceled', 'reconcile_needed'
--     );
