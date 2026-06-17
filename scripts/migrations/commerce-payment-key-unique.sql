-- commerce_payments.payment_key partial UNIQUE
--
-- === 적용 전 read-only 중복 검사 ===
-- SELECT payment_key, COUNT(*) AS cnt, array_agg(order_id) AS order_ids
-- FROM commerce_payments
-- WHERE payment_key IS NOT NULL AND trim(payment_key) <> ''
-- GROUP BY payment_key
-- HAVING COUNT(*) > 1;
--
-- === 빈 문자열 정규화 (운영 데이터 변경 — 적용 전 승인·백업 필수) ===
-- UPDATE commerce_payments SET payment_key = NULL WHERE payment_key IS NOT NULL AND trim(payment_key) = '';
--
-- === lookup index (CONCURRENTLY 불필요, idempotent) ===
CREATE INDEX IF NOT EXISTS idx_commerce_payments_payment_key_lookup
  ON commerce_payments (payment_key)
  WHERE payment_key IS NOT NULL;

-- === Production UNIQUE (트랜잭션 밖, CONCURRENTLY) ===
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_commerce_payments_payment_key_unique
--   ON commerce_payments (payment_key)
--   WHERE payment_key IS NOT NULL;
