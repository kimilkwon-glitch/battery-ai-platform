#!/usr/bin/env node
/**
 * Production banner upload E2E — uses production env pull for admin + blob only.
 * Does NOT log secrets. Creates inactive test banner and cleans up optional.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { parseEnvFileValue } from "./_env-file-utils.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.argv[2] ?? "https://www.batterymanager.co.kr";
const envPath = process.argv[3] ?? path.join(root, ".vercel-env-probe.tmp");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    process.env[trimmed.slice(0, i).trim()] = parseEnvFileValue(trimmed.slice(i + 1));
  }
}

loadEnvFile(envPath);

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const stored = (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "").trim();
const username = process.env.ADMIN_USERNAME?.trim();

function verify(pass) {
  if (!stored.startsWith("scrypt:")) return pass === stored;
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  const actual = scryptSync(pass, salt, 64, SCRYPT_OPTS);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function login() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!username || !password || !verify(password)) {
    return { ok: false, reason: "admin_credentials_unavailable" };
  }
  const res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/bm_admin_session=([^;]+)/);
  return { ok: res.ok && Boolean(match), cookie: match ? `bm_admin_session=${match[1]}` : null };
}

function pngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

async function upload(cookie, label) {
  const form = new FormData();
  form.append("file", new File([pngBuffer()], `${label}.png`, { type: "image/png" }));
  const res = await fetch(`${BASE}/api/admin/banners/upload`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  return { label, status: res.status, ok: Boolean(body.ok && body.url), url: body.url, message: body.message };
}

async function headUrl(url) {
  const res = await fetch(url, { method: "HEAD" });
  return res.status;
}

const report = { base: BASE, login: null, uploads: [], banner: null, head: null, cleanup: null };

const loginResult = await login();
report.login = { ok: loginResult.ok, reason: loginResult.reason ?? null };
if (!loginResult.ok || !loginResult.cookie) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}

report.uploads.push(await upload(loginResult.cookie, "probe-pc"));
report.uploads.push(await upload(loginResult.cookie, "probe-mobile"));

if (!report.uploads.every((u) => u.ok)) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

const pcUrl = report.uploads[0].url;
const mobileUrl = report.uploads[1].url;
report.head = {
  pc: await headUrl(pcUrl),
  mobile: await headUrl(mobileUrl),
};

const createRes = await fetch(`${BASE}/api/admin/banners`, {
  method: "POST",
  headers: { Cookie: loginResult.cookie, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "[E2E] 배너 업로드 검증 (삭제 가능)",
    subtitle: "자동 검증용 — 비활성",
    imageUrl: pcUrl,
    mobileImageUrl: mobileUrl,
    linkUrl: "/",
    status: "inactive",
    sortOrder: 0,
    showOnMain: false,
  }),
});
const created = await createRes.json().catch(() => ({}));
report.banner = { ok: Boolean(createRes.ok && created.ok), id: created.item?.id ?? null, status: createRes.status };

console.log(JSON.stringify(report, null, 2));
process.exit(report.banner.ok && report.head.pc === 200 && report.head.mobile === 200 ? 0 : 1);
