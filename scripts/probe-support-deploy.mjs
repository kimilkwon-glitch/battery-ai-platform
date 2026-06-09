const STAMP = "BM-SUPPORT-CENTER-HUB-V2-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";

const res = await fetch(`${BASE}/support?cb=support-v2`, {
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();
const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";

const checks = {
  status: res.status === 200,
  stamp: stamp.includes("BM-SUPPORT-CENTER-HUB-V2"),
  hero: html.includes("고객센터"),
  search: html.includes("무엇을 도와드릴까요?"),
  ctaConsult: html.includes("상담 문의하기"),
  ctaLookup: html.includes("주문 조회하기"),
  hubV2: html.includes("support-hub-v2"),
  noTabRail: !html.includes("공지사항</button>") || html.includes("support-hub-v2"),
};

const ok = Object.values(checks).every(Boolean);
console.log(`stamp=${stamp}`);
console.log(checks);
console.log(`\n${ok ? "PASS" : "FAIL"} (expected ${STAMP})`);
process.exit(ok ? 0 : 1);
