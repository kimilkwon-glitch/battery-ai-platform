import "server-only";

import { getOAuthRedirectUri } from "@/lib/auth/oauth-config";

export type NaverOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type NaverOAuthProfile = {
  naverId: string;
  name: string;
  email?: string;
  profileImage?: string;
};

/** getGoogleOAuthConfig OAUTH_RETURN_COOKIE와 동일 키 */
export const NAVER_OAUTH_RETURN_COOKIE = "bm_oauth_return";

export function getNaverOAuthConfig(): NaverOAuthConfig | null {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  const redirectUri = getOAuthRedirectUri("naver");
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isNaverOAuthConfigured(): boolean {
  return getNaverOAuthConfig() != null;
}

type NaverTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type NaverUserResponse = {
  resultcode?: string;
  message?: string;
  response?: {
    id?: string;
    email?: string;
    name?: string;
    profile_image?: string;
  };
};

export async function exchangeNaverAuthorizationCode(
  code: string,
  state: string,
): Promise<{ accessToken: string } | null> {
  const config = getNaverOAuthConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    state,
  });

  let response: Response;
  try {
    response = await fetch(
      `https://nid.naver.com/oauth2.0/token?${params.toString()}`,
      { cache: "no-store" },
    );
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as NaverTokenResponse;
  const accessToken = data.access_token?.trim();
  if (!accessToken) return null;

  return { accessToken };
}

export async function fetchNaverUserProfile(accessToken: string): Promise<NaverOAuthProfile | null> {
  let response: Response;
  try {
    response = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as NaverUserResponse;
  const id = data.response?.id?.trim();
  if (!id) return null;

  const name = data.response?.name?.trim() || "네이버 회원";
  const email = data.response?.email?.trim() || undefined;
  const profileImage = data.response?.profile_image?.trim() || undefined;

  return { naverId: id, name, email, profileImage };
}
