import "server-only";

export function isMemberUniqueViolation(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /unique|duplicate key|idx_members/i.test(msg);
}
