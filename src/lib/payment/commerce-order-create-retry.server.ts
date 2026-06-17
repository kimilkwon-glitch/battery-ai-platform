import "server-only";

export const MAX_ORDER_NUMBER_CREATE_RETRIES = 3;

export function isPostgresUniqueViolation(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("unique") ||
    msg.includes("duplicate") ||
    msg.includes("23505")
  );
}

export function isOrderNumberUniqueViolation(err: unknown): boolean {
  if (!isPostgresUniqueViolation(err)) return false;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("order_number") || msg.includes("idx_commerce_orders") && !msg.includes("checkout_attempt");
}

export function isCheckoutAttemptUniqueViolation(err: unknown): boolean {
  if (!isPostgresUniqueViolation(err)) return false;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("checkout_attempt");
}
