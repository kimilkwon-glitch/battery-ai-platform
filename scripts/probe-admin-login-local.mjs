/**
 * 로컬 관리자 로그인 검수 — 비밀번호는 ADMIN_TEST_PASS 환경변수로만 전달
 */
const BASE = process.env.ADMIN_PROBE_BASE ?? "http://localhost:3000";
const USER = process.env.ADMIN_TEST_USER ?? "admin";
const NEW_PASS = process.env.ADMIN_TEST_PASS ?? "";
const OLD_KEY = process.env.ADMIN_OLD_KEY ?? "1234";

if (!NEW_PASS) {
  console.error("ADMIN_TEST_PASS required");
  process.exit(1);
}

async function login(username, password) {
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: json.ok === true, cookie: setCookie.includes("bm_admin_session") };
}

const legacy = await login(USER, OLD_KEY);
console.log("legacyAccessKeyBlocked", !legacy.ok, legacy.status);

const fresh = await login(USER, NEW_PASS);
console.log("newPasswordOk", fresh.ok, fresh.status, fresh.cookie);

process.exit(fresh.ok && fresh.cookie && !legacy.ok ? 0 : 1);
