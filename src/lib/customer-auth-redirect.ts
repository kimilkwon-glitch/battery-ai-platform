import { CUSTOMER_LOGIN_PAGE } from "@/lib/customer-auth-routes";
import { CUSTOMER_COMPLETE_PROFILE_PAGE } from "@/lib/customer-auth-routes";

export function buildLoginRedirectUrl(returnPath: string): string {
  const path = returnPath.trim() || "/checkout";
  return `${CUSTOMER_LOGIN_PAGE}?redirect=${encodeURIComponent(path)}`;
}

export function buildCompleteProfileRedirectUrl(returnPath: string): string {
  const path = returnPath.trim() || "/checkout";
  return `${CUSTOMER_COMPLETE_PROFILE_PAGE}?redirect=${encodeURIComponent(path)}`;
}

export function resolveClientReturnPath(fallback = "/checkout"): string {
  if (typeof window === "undefined") return fallback;
  return `${window.location.pathname}${window.location.search}` || fallback;
}
