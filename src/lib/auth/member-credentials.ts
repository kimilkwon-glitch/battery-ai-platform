import "server-only";

export function getCustomerSessionSecret(): string {
  const secret = process.env.CUSTOMER_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET is not configured");
  }
  return secret;
}

export function isCustomerAuthConfigured(): boolean {
  return Boolean(process.env.CUSTOMER_SESSION_SECRET?.trim());
}
