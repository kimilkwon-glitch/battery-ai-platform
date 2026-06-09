#!/usr/bin/env node
/**
 * Production admin login 검수 — 비밀번호는 환경변수로만 전달
 * ADMIN_TEST_USER=admin ADMIN_TEST_PASS=*** ADMIN_OLD_PASS=*** node scripts/probe-admin-login-deploy.mjs
 */
const BASE = process.env.ADMIN_PROBE_BASE ?? "https://battery-ai-platform.vercel.app";
const STAMP = process.env.ADMIN_PROBE_STAMP ?? "BM-ADMIN-AUTH-ENV-20260606-V1";
const USER = process.env.ADMIN_TEST_USER ?? "admin";
const NEW_PASS = process.env.ADMIN_TEST_PASS ?? "";
const OLD_PASS = process.env.ADMIN_OLD_PASS ?? "";

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

const stampRes = await fetch(`${BASE}/admin/login?t=${Date.now()}`);
const stampHtml = await stampRes.text();
const stamp = stampHtml.match(/data-build-version="([^"]+)"/)?.[1];
console.log("stampOk", stamp === STAMP, stamp);

const oldLogin = OLD_PASS ? await login(USER, OLD_PASS) : { status: 0, ok: false, cookie: false };
console.log("oldPasswordBlocked", !oldLogin.ok, oldLogin.status);

const newLogin = await login(USER, NEW_PASS);
console.log("newPasswordOk", newLogin.ok, newLogin.status, newLogin.cookie);

if (!newLogin.cookie) process.exit(1);

const cookieHeader = newLogin.cookie
  ? { Cookie: (await fetch(`${BASE}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: USER, password: NEW_PASS }),
    })).headers.get("set-cookie")?.split(";")[0] ?? "" }
  : {};

// Re-login to capture cookie for session tests
const sessionLogin = await fetch(`${BASE}/api/admin/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: USER, password: NEW_PASS }),
});
const sessionCookie = sessionLogin.headers.get("set-cookie")?.split(";")[0] ?? "";

const adminRes = await fetch(`${BASE}/admin`, {
  redirect: "manual",
  headers: sessionCookie ? { Cookie: sessionCookie } : {},
});
console.log("adminDashboard", adminRes.status, adminRes.headers.get("location") ?? "ok");

const logoutRes = await fetch(`${BASE}/api/admin/auth/logout`, {
  method: "POST",
  headers: sessionCookie ? { Cookie: sessionCookie } : {},
});
console.log("logout", logoutRes.status);

const afterLogout = await fetch(`${BASE}/admin`, { redirect: "manual" });
const redirectLogin = afterLogout.headers.get("location") ?? "";
console.log("afterLogoutRedirect", redirectLogin.includes("/admin/login"), afterLogout.status);
