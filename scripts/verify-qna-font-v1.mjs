/**
 * Q&A + font V1 검수 — BASE_URL 기본 http://127.0.0.1:3000
 * 사용: node scripts/verify-qna-font-v1.mjs [baseUrl]
 */
const BASE = (process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const STAMP = "BM-UX-REV-20260528-QNA-FONT-V1-FIX1";

const routes = [
  "/",
  "/community",
  "/community/q-porter2-year",
  "/community/q-blackbox",
  "/community/q-agm60l-vs-ev12v",
  "/search?q=" + encodeURIComponent("포터2 배터리"),
  "/search?q=" + encodeURIComponent("레이 블랙박스 방전"),
  "/search?q=" + encodeURIComponent("봉고3 DIN74L"),
  "/search?q=" + encodeURIComponent("100R vs AGM95L"),
  "/search?q=" + encodeURIComponent("스포티지 NQ5 하이브리드"),
  "/search?q=" + encodeURIComponent("K8 하이브리드"),
  "/search?q=" + encodeURIComponent("CMF80L"),
  "/search?q=" + encodeURIComponent("EV6 보조배터리"),
  "/batteries/AGM60L",
  "/batteries/100R",
  "/batteries/CMF80L",
  "/vehicle/sportage-nq5?fuel=" + encodeURIComponent("하이브리드"),
  "/vehicle/k8-gl3?fuel=" + encodeURIComponent("하이브리드"),
  "/compare?items=100R,AGM95L",
];

const markers = [
  STAMP,
  "data-section=\"related-qna\"",
  "data-section=\"home-popular-qna\"",
  "배터리 매칭 질문 허브",
  "관련 질문",
  "사진으로 최종 확인",
  "--font-heading",
  "Pretendard",
];

const FONT_PATHS = [
  "/fonts/Pretendard-1.3.9/web/variable/woff2/PretendardVariable.woff2",
  "/fonts/GmarketSansTTF/GmarketSansTTFBold.ttf",
  "/fonts/S-Core_Dream_OTF/SCDream5.otf",
];

async function check(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  const html = await res.text();
  const ok = res.ok && html.includes(STAMP);
  const hits = markers.filter((m) => html.includes(m));
  return { path, status: res.status, stamp: ok, hits, len: html.length };
}

async function checkFonts() {
  const rows = [];
  for (const path of FONT_PATHS) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, { method: "HEAD", headers: { "cache-control": "no-cache" } }).catch(() => null);
    const ok = res?.ok && res.status === 200;
    rows.push({ path, status: res?.status ?? 0, ok });
    console.log(`${ok ? "FONT OK" : "FONT FAIL"} ${res?.status ?? "ERR"} ${path}`);
  }
  return rows;
}

async function main() {
  console.log(`Verify ${STAMP} @ ${BASE}\n`);
  console.log("Font assets:");
  const fonts = await checkFonts();
  console.log("");
  const results = [];
  for (const path of routes) {
    try {
      const row = await check(path);
      results.push(row);
      const flag = row.stamp ? "OK" : "FAIL";
      console.log(`${flag} ${row.status} ${path} (markers ${row.hits.length}/${markers.length})`);
    } catch (e) {
      results.push({ path, error: String(e) });
      console.log(`ERR ${path} ${e}`);
    }
  }
  const failed = results.filter((r) => !r.stamp && !r.error);
  const fontFailed = fonts.filter((f) => !f.ok).length;
  console.log(`\nDone: ${results.length - failed.length}/${results.length} stamp OK, fonts ${fonts.length - fontFailed}/${fonts.length} OK`);
  process.exit(failed.length > 0 || fontFailed > 0 ? 1 : 0);
}

main();
