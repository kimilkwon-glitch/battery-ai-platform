#!/usr/bin/env node
/**
 * Production search quality audit — HTML evidence collector
 * Usage: node scripts/search-quality-audit.mjs [baseUrl] [--json-out path]
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const jsonOutArg = process.argv.indexOf("--json-out");
const JSON_OUT =
  jsonOutArg >= 0 ? process.argv[jsonOutArg + 1] : null;

const QUERIES = [
  { id: 1, group: "차량", q: "포터2 20년식", expect: { intent: "차량", spec: /100R/, vehicle: /porter2-new/ } },
  { id: 2, group: "차량", q: "포터2 2019", expect: { intent: "차량", spec: /90R/, vehicle: /porter2-old/ } },
  { id: 3, group: "차량", q: "포터2 배터리", expect: { intent: "차량", spec: /90R|100R/ } },
  { id: 4, group: "차량", q: "쏘렌토 MQ4 하이브리드", expect: { intent: "차량", primary: "AGM60L", vehicle: /sorento-mq4/ } },
  { id: 5, group: "차량", q: "쏘렌토 MQ4 디젤", expect: { intent: "차량", primary: "AGM80L", vehicle: /sorento-mq4/ } },
  { id: 6, group: "차량", q: "그랜저 IG 가솔린", expect: { intent: "차량", primary: "AGM70L" } },
  { id: 7, group: "차량", q: "그랜저 IG 디젤", expect: { intent: "차량", primary: "AGM80L" } },
  { id: 8, group: "차량", q: "스포티지 NQ5 하이브리드", expect: { intent: "차량", primary: /AGM60L|AGM/ } },
  { id: 9, group: "차량", q: "싼타페 MX5 하이브리드", expect: { intent: "차량", primary: /AGM60L|AGM/ } },
  { id: 10, group: "차량", q: "K8 하이브리드", expect: { intent: "차량", primary: /AGM60L|AGM/ } },
  { id: 11, group: "차량", q: "EV6 보조배터리", expect: { intent: /차량|통합/, ev: true } },
  { id: 12, group: "차량", q: "아이오닉5 배터리", expect: { intent: /차량|통합/, ev: true } },
  { id: 13, group: "차량", q: "스타리아 디젤 CMF80L", expect: { intent: /차량|규격/, primary: "CMF80L" } },
  { id: 14, group: "차량", q: "봉고3 DIN74L", expect: { intent: /차량|규격/, primary: "DIN74L" } },
  { id: 15, group: "차량", q: "레이 블랙박스 방전", expect: { intent: /증상|통합/ } },
  { id: 16, group: "규격", q: "AGM70L", expect: { intent: "규격", primary: "AGM70L", batteryCard: true } },
  { id: 17, group: "규격", q: "AGM80L", expect: { intent: "규격", primary: "AGM80L", batteryCard: true } },
  { id: 18, group: "규격", q: "AGM60L", expect: { intent: "규격", primary: "AGM60L", batteryCard: true } },
  { id: 19, group: "규격", q: "DIN74L", expect: { intent: "규격", primary: "DIN74L", batteryCard: true } },
  { id: 20, group: "규격", q: "100R", expect: { intent: "규격", primary: "100R", batteryCard: true } },
  { id: 21, group: "규격", q: "CMF80L", expect: { intent: "규격", primary: "CMF80L", batteryCard: true } },
  { id: 22, group: "규격", q: "단자 방향 CMF80L", expect: { intent: "단자", primary: "CMF80L" } },
  { id: 23, group: "규격", q: "AGM60L vs 115D31L", expect: { intent: "비교", compare: true } },
  { id: 24, group: "규격", q: "100R vs AGM95L", expect: { intent: "비교", compare: true } },
  { id: 25, group: "목적", q: "부산 배터리 출장", expect: { purpose: true } },
  { id: 26, group: "목적", q: "덕천 배터리 교체", expect: { purpose: true } },
  { id: 27, group: "목적", q: "학장점 배터리 교체", expect: { purpose: true } },
  { id: 28, group: "목적", q: "택배 배터리 주문", expect: { purpose: true, order: true } },
  { id: 29, group: "목적", q: "배터리 상품 확인", expect: { purpose: true, shop: true } },
];

const INTENT_LABELS = [
  "차량 검색",
  "규격 검색",
  "비교 검색",
  "통합검색",
  "증상 검색",
  "단자 방향 검색",
  "업그레이드 검색",
];

const NO_SPEC = "아직 등록된 차량 규격 정보가 없습니다";
const NO_VEHICLE = "일치하는 차량 정보를 찾지 못했습니다";

function decodeHtml(s) {
  return s
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'");
}

function extractIntentLabel(html) {
  for (const label of INTENT_LABELS) {
    if (html.includes(`>${label}</p>`) || html.includes(`>${label}<`)) return label;
  }
  return null;
}

function extractDisplayQuery(html) {
  const m = html.match(/&ldquo;([^&]+)&rdquo;\s*검색 결과/);
  return m ? decodeHtml(m[1]) : null;
}

function extractRecommendedBattery(html) {
  const focus = html.includes('id="search-focus"');
  const cardMatch = html.match(
    /<h3[^>]*>\s*([A-Z0-9]+)\s*<span[^>]*>배터리<\/span>/i,
  );
  const primaryCode = cardMatch?.[1]?.toUpperCase() ?? null;
  return { focus, primaryCode };
}

function extractSummarySpecs(html) {
  const rows = [];
  const re =
    /<dt[^>]*>[\s\S]*?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const label = m[0].replace(/<[^>]+>/g, "").trim().slice(0, 20);
    const val = m[1].replace(/<[^>]+>/g, "").trim();
    if (label && val) rows.push({ label, val });
  }
  if (rows.length === 0) {
    const specLine = html.match(/추천 규격[\s\S]{0,80}?>([^<]+)</);
    if (specLine) rows.push({ label: "추천 규격", val: specLine[1].trim() });
  }
  return rows;
}

function extractLinks(html, prefix) {
  const re = new RegExp(`href="(${prefix}[^"]+)"`, "gi");
  const out = new Set();
  let m;
  while ((m = re.exec(html)) !== null) out.add(m[1].split("#")[0]);
  return [...out];
}

function extractCtas(html) {
  const primary = [];
  const secondary = [];
  const re = /<a[^>]*class="[^"]*btnPrimary[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)</gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    primary.push({ label: m[2].trim(), href: m[1] });
  }
  const re2 = /<a[^>]*class="[^"]*btnSecondary[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)</gi;
  while ((m = re2.exec(html)) !== null) {
    secondary.push({ label: m[2].trim(), href: m[1] });
  }
  const re3 = /<a[^>]*class="[^"]*btnTertiary[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)</gi;
  const tertiary = [];
  while ((m = re3.exec(html)) !== null) {
    tertiary.push({ label: m[2].trim(), href: m[1] });
  }
  return { primary, secondary, tertiary };
}

function hasBatteryImages(html) {
  return (
    /<img[^>]+alt="[^"]*배터리/i.test(html) ||
    /BatteryThumbnail|battery.*\.(?:jpg|png|webp)/i.test(html) ||
    (html.includes("role=\"main\"") && /\/batteries\//.test(html))
  );
}

function extractVisibleBatteryCodes(html) {
  const codes = new Set();
  for (const m of html.matchAll(/href="\/batteries\/([A-Z0-9]+)"/gi)) {
    codes.add(m[1].toUpperCase());
  }
  for (const m of html.matchAll(/>(AGM\d+L|DIN\d+L|CMF\d+L|100R|90R|115D31L|AGM95L)</gi)) {
    codes.add(m[1].toUpperCase());
  }
  return [...codes];
}

function photoIsMainAnswer(ctas, html) {
  const photoPrimary = ctas.primary.some((c) => /사진/.test(c.label));
  const noBatteryFocus = !html.includes('id="search-focus"');
  const photoHero =
    noBatteryFocus &&
    ctas.primary[0] &&
    /사진/.test(ctas.primary[0].label) &&
    !ctas.primary.some((c) => /규격|배터리|차량/.test(c.label));
  return photoPrimary || photoHero;
}

function snippetAround(html, needle, len = 120) {
  const i = html.indexOf(needle);
  if (i < 0) return null;
  return html.slice(Math.max(0, i - 40), i + len).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function auditOne(item) {
  const url = `${BASE}/search?q=${encodeURIComponent(item.q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BM-Search-Audit/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  const html = await res.text();
  const intentLabel = extractIntentLabel(html);
  const displayQuery = extractDisplayQuery(html);
  const { focus, primaryCode } = extractRecommendedBattery(html);
  const summaryRows = extractSummarySpecs(html);
  const vehicleHrefs = extractLinks(html, "/vehicle/");
  const batteryHrefs = extractLinks(html, "/batteries/");
  const batteryCodes = extractVisibleBatteryCodes(html);
  const ctas = extractCtas(html);
  const hasImages = hasBatteryImages(html);
  const noSpec = html.includes(NO_SPEC);
  const noVehicle = html.includes(NO_VEHICLE);
  const hasCompare = /\/compare\?/.test(html) || html.includes("비교");
  const hasHero = html.includes("statusLabel") || /rounded-2xl border border-blue-100/.test(html);

  const specDisplay =
    summaryRows.find((r) => /추천|규격|검색한/.test(r.label))?.val ??
    primaryCode ??
    batteryCodes[0] ??
    null;

  const vehicleDetailOk =
    vehicleHrefs.length > 0 &&
    (item.expect?.vehicle ? item.expect.vehicle.test(vehicleHrefs[0]) : true);

  const batteryDetailOk =
    batteryHrefs.length > 0 ||
    ctas.primary.some((c) => c.href.startsWith("/batteries/")) ||
    Boolean(primaryCode);

  const flags = [];
  if (res.status !== 200) flags.push("http-error");
  if (noSpec && item.expect?.primary) flags.push("no-spec-but-expected");
  if (noVehicle && item.group === "차량" && !item.expect?.intent?.toString().includes("증상"))
    flags.push("no-vehicle");
  if (item.expect?.batteryCard && !focus && !primaryCode) flags.push("missing-spec-card");
  if (item.expect?.primary && primaryCode) {
    const exp = item.expect.primary;
    if (typeof exp === "string" && primaryCode !== exp) flags.push(`primary-mismatch:${primaryCode}`);
    else if (exp instanceof RegExp && !exp.test(primaryCode)) flags.push(`primary-mismatch:${primaryCode}`);
  }
  if (item.expect?.vehicle && !vehicleHrefs.some((h) => item.expect.vehicle.test(h)))
    flags.push("vehicle-href-mismatch");
  if (item.expect?.compare && !hasCompare) flags.push("missing-compare");
  if (photoIsMainAnswer(ctas, html) && (focus || primaryCode)) flags.push("photo-over-primary-with-answer");

  return {
    ...item,
    url,
    status: res.status,
    intentLabel,
    displayQuery,
    summaryRows,
    specDisplay,
    primaryCode,
    batteryFocus: focus,
    batteryCodes,
    vehicleHrefs: vehicleHrefs.slice(0, 5),
    batteryHrefs: batteryHrefs.slice(0, 5),
    hasBatteryImage: hasImages,
    hasBatteryGrid: html.includes("관련 배터리 규격") || html.includes("BatteryImageCard"),
    ctas,
    photoMainIssue: photoIsMainAnswer(ctas, html) && !focus,
    noSpec,
    noVehicle,
    hasCompare,
    hasHero,
    flags,
    titleSnippet: snippetAround(html, "검색 결과") ?? snippetAround(html, "배터리 확인"),
  };
}

const results = [];
for (const q of QUERIES) {
  process.stderr.write(`audit #${q.id} ${q.q}\n`);
  results.push(await auditOne(q));
  await new Promise((r) => setTimeout(r, 200));
}

const payload = { base: BASE, auditedAt: new Date().toISOString(), results };
if (JSON_OUT) {
  mkdirSync(dirname(JSON_OUT), { recursive: true });
  writeFileSync(JSON_OUT, JSON.stringify(payload, null, 2), "utf8");
}
console.log(JSON.stringify(payload, null, 2));
