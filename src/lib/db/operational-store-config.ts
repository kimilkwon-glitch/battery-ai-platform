import { isPostgresConfigured } from "@/lib/db/postgres";

export type OperationalStoreMode = "postgres" | "json-dev" | "unavailable";

export type OperationalStoreDomain =
  | "claims"
  | "order_requests"
  | "inquiries"
  | "battery_talk"
  | "order_admin_meta"
  | "support_notices"
  | "consultation_settings";

export class OperationalStoreError extends Error {
  readonly code: "OPERATIONAL_DB_UNAVAILABLE" | "OPERATIONAL_STORE_ERROR";
  readonly domain?: OperationalStoreDomain;

  constructor(
    message: string,
    code: "OPERATIONAL_DB_UNAVAILABLE" | "OPERATIONAL_STORE_ERROR" = "OPERATIONAL_STORE_ERROR",
    domain?: OperationalStoreDomain,
  ) {
    super(message);
    this.name = "OperationalStoreError";
    this.code = code;
    this.domain = domain;
  }
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function hasDatabaseUrl(): boolean {
  return isPostgresConfigured();
}

export function isOperationalDbMode(): boolean {
  return hasDatabaseUrl();
}

export function isOperationalJsonFallbackAllowed(): boolean {
  return !isProductionRuntime();
}

export function getOperationalStoreMode(): OperationalStoreMode {
  if (hasDatabaseUrl()) return "postgres";
  if (isOperationalJsonFallbackAllowed()) return "json-dev";
  return "unavailable";
}

export function isOperationalStoreReady(): boolean {
  return getOperationalStoreMode() !== "unavailable";
}

export function assertOperationalStoreAvailable(domain?: OperationalStoreDomain): void {
  if (hasDatabaseUrl()) return;
  if (isOperationalJsonFallbackAllowed()) return;
  throw new OperationalStoreError(
    `DATABASE_URL is required for operational data storage in production${domain ? ` (${domain})` : ""}.`,
    "OPERATIONAL_DB_UNAVAILABLE",
    domain,
  );
}

export function isOperationalStoreError(err: unknown): err is OperationalStoreError {
  return err instanceof OperationalStoreError;
}

export type OperationalStoreStatus = {
  mode: OperationalStoreMode;
  ready: boolean;
  domains: Record<OperationalStoreDomain, OperationalStoreMode>;
};

export function getOperationalStoreStatus(): OperationalStoreStatus {
  const mode = getOperationalStoreMode();
  const domainMode = mode;
  return {
    mode,
    ready: mode !== "unavailable",
    domains: {
      claims: domainMode,
      order_requests: domainMode,
      inquiries: domainMode,
      battery_talk: domainMode,
      order_admin_meta: domainMode,
      support_notices: domainMode,
      consultation_settings: domainMode,
    },
  };
}
