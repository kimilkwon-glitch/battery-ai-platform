import "server-only";

export type KakaoOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type KakaoOAuthProfile = {
  kakaoId: string;
  name: string;
  email?: string;
};

export const KAKAO_OAUTH_HANDOFF_COOKIE = "bm_kakao_oauth_handoff";
export const KAKAO_OAUTH_RETURN_COOKIE = "bm_oauth_return";

/** KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI 만 사용 */
export function getKakaoOAuthConfig(): KakaoOAuthConfig | null {
  const clientId = process.env.KAKAO_CLIENT_ID?.trim();
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  const redirectUri = process.env.KAKAO_REDIRECT_URI?.trim()?.replace(/\/$/, "");
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isKakaoOAuthConfigured(): boolean {
  return getKakaoOAuthConfig() != null;
}

type KakaoTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type KakaoUserResponse = {
  id?: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
    };
  };
};

export async function exchangeKakaoAuthorizationCode(
  code: string,
): Promise<{ accessToken: string } | null> {
  const config = getKakaoOAuthConfig();
  if (!config) return null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  let response: Response;
  try {
    response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as KakaoTokenResponse;
  const accessToken = data.access_token?.trim();
  if (!accessToken) return null;

  return { accessToken };
}

export async function fetchKakaoUserProfile(accessToken: string): Promise<KakaoOAuthProfile | null> {
  let response: Response;
  try {
    response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const data = (await response.json()) as KakaoUserResponse;
  if (!data.id) return null;

  const name = data.kakao_account?.profile?.nickname?.trim() || "카카오 회원";
  const email = data.kakao_account?.email?.trim() || undefined;

  return {
    kakaoId: String(data.id),
    name,
    email,
  };
}
