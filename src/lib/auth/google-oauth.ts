import "server-only";

import { PRODUCTION_SITE_ORIGIN } from "@/lib/site-url";

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleOAuthProfile = {
  googleId: string;
  name: string;
  email?: string;
};

export const GOOGLE_OAUTH_HANDOFF_COOKIE = "bm_google_oauth_handoff";
export const OAUTH_RETURN_COOKIE = "bm_oauth_return";

const GOOGLE_SCOPES = "openid email profile";

function isDisallowedProductionRedirect(uri: string): boolean {
  try {
    const host = new URL(uri).hostname.toLowerCase();
    return host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

function resolveGoogleRedirectUri(): string | null {
  const fromEnv = process.env.GOOGLE_REDIRECT_URI?.trim()?.replace(/\/$/, "");
  if (fromEnv) {
    if (process.env.VERCEL_ENV === "production" && isDisallowedProductionRedirect(fromEnv)) {
      return null;
    }
    return fromEnv;
  }

  if (process.env.VERCEL_ENV === "production") {
    return `${PRODUCTION_SITE_ORIGIN}/api/auth/google/callback`;
  }

  return null;
}

/** GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI(또는 production 기본 callback) */
export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = resolveGoogleRedirectUri();
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthConfig() != null;
}

export function getGoogleOAuthScopes(): string {
  return GOOGLE_SCOPES;
}

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfoResponse = {
  sub?: string;
  name?: string;
  email?: string;
};

export async function exchangeGoogleAuthorizationCode(
  code: string,
): Promise<{ accessToken: string } | null> {
  const config = getGoogleOAuthConfig();
  if (!config) return null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  let response: Response;
  try {
    response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as GoogleTokenResponse;
  const accessToken = data.access_token?.trim();
  if (!accessToken) return null;

  return { accessToken };
}

export async function fetchGoogleUserProfile(
  accessToken: string,
): Promise<GoogleOAuthProfile | null> {
  let response: Response;
  try {
    response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as GoogleUserInfoResponse;
  if (!data.sub) return null;

  const name = data.name?.trim() || "구글 회원";
  const email = data.email?.trim() || undefined;

  return {
    googleId: data.sub,
    name,
    email,
  };
}
