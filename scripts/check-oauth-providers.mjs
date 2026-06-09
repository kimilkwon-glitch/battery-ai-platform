/**
 * 로컬 OAuth env 점검 — node scripts/check-oauth-providers.mjs
 * .env.local 값을 읽어 /api/auth/providers 와 동일한 판별 로직을 출력한다.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function isDisallowedProductionRedirect(uri) {
  try {
    const host = new URL(uri).hostname.toLowerCase();
    return host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

function resolveGoogleRedirectUri() {
  const fromEnv = process.env.GOOGLE_REDIRECT_URI?.trim()?.replace(/\/$/, "");
  if (fromEnv) {
    if (process.env.VERCEL_ENV === "production" && isDisallowedProductionRedirect(fromEnv)) {
      return null;
    }
    return fromEnv;
  }
  if (process.env.VERCEL_ENV === "production") {
    return "https://www.batterymanager.co.kr/api/auth/google/callback";
  }
  return null;
}

function getKakaoConfig() {
  const clientId = process.env.KAKAO_CLIENT_ID?.trim();
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  const redirectUri = process.env.KAKAO_REDIRECT_URI?.trim()?.replace(/\/$/, "");
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, redirectUri };
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = resolveGoogleRedirectUri();
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, redirectUri };
}

loadEnvLocal();

const result = {
  naver: Boolean(
    process.env.NAVER_CLIENT_ID?.trim() && process.env.NAVER_CLIENT_SECRET?.trim(),
  ),
  kakao: getKakaoConfig() != null,
  google: getGoogleConfig() != null,
};

const redirects = {
  naver:
    process.env.NAVER_REDIRECT_URI?.trim()?.replace(/\/$/, "") ||
    "https://www.batterymanager.co.kr/api/auth/naver/callback (default)",
  kakao: getKakaoConfig()?.redirectUri ?? "(missing KAKAO_REDIRECT_URI)",
  google: getGoogleConfig()?.redirectUri ?? "(not configured)",
};

console.log(JSON.stringify({ providers: result, redirectUris: redirects }, null, 2));
