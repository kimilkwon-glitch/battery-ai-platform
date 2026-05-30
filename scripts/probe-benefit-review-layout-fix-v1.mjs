const STAMP = process.argv[3] || "BM-UX-REV-20260530-BENEFIT-REVIEW-LAYOUT-FIX-V1";
const BASE = process.argv[2] || "http://127.0.0.1:3000";
const CB = "benefit-review-layout-fix-v1-20260530";

const PATHS = ["/", "/benefits", "/reviews"];

async function fetchHtml(path) {
  const url = `${BASE}${path}?_cb=${CB}`;
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  const html = await res.text();
  return { url, status: res.status, html };
}

function check(path, html) {
  const stamps = [...new Set(html.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const forbidden = [
    "UI 검증용 샘플",
    "샘플입니다",
    "리뷰 작성 (준비중)",
    "이미지 준비중",
    "사진 준비중",
    "사진 없음",
    "준비중",
  ].filter((t) => html.includes(t));

  const hasHero = html.includes("home-hero-carousel");
  const hasBenefitCard = html.includes("home-benefit-card");
  const hasReviewCard = html.includes("review-card");

  return {
    path,
    ok: stamps.includes(STAMP) && forbidden.length === 0,
    stamps,
    forbidden,
    hasHero,
    hasBenefitCard,
    hasReviewCard,
  };
}

const results = [];
for (const path of PATHS) {
  const { html, url, status } = await fetchHtml(path);
  results.push({ url, status, ...check(path, html) });
}

console.log(JSON.stringify({ stamp: STAMP, base: BASE, results }, null, 2));
const allOk = results.every((r) => r.ok && r.status === 200);
process.exit(allOk ? 0 : 1);
