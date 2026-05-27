#!/usr/bin/env node
/**
 * 프로덕션 HTML 스모크 검증 — BUILD_VERSION·핵심 UX 마커
 * Usage: node scripts/verify-production-evidence.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const VERSION = "BM-UX-REV-20260528-SORENTO-LINK-FIX";

const EXPECTED_SORENTO_HYBRID_HREF =
  "/vehicle/sorento-mq4?fuel=%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C";

/** HTML에서 쏘렌토 MQ4 하이브리드 대표 적용 차량 링크 href 추출 */
function extractSorentoMq4HybridHref(html) {
  const anchorRe = /<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi;
  let match;
  while ((match = anchorRe.exec(html)) !== null) {
    const block = match[0];
    const href = match[1];
    if (!/쏘렌토|MQ4|하이브리드|HEV/i.test(block)) continue;
    if (/sorento-mq4/i.test(href) && /fuel=/i.test(href)) return href;
  }
  const encoded =
    html.match(
      /href="(\/vehicle\/sorento-mq4\?fuel=(?:%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C|하이브리드)[^"]*)"/i,
    )?.[1] ?? null;
  return encoded;
}

/** href가 실제 응답 URL에 sorento-xm을 포함하지 않는지 (리다이렉트·최종 URL) */
async function hrefDoesNotLandOnSorentoXm(hrefPath) {
  const res = await fetch(`${BASE}${hrefPath}`, {
    headers: { "User-Agent": "BM-Production-Verify/1.0" },
    redirect: "follow",
  });
  const finalUrl = res.url ?? "";
  const body = await res.text();
  return (
    res.status === 200 &&
    !finalUrl.includes("/vehicle/sorento-xm") &&
    (finalUrl.includes("/vehicle/sorento-mq4") || body.includes("data-ux=\"fuel-battery-hero-cards\""))
  );
}

const checks = [
  {
    name: "build-version (home)",
    url: "/",
    test: (html) => html.includes(VERSION) && html.includes("data-build-version"),
  },
  {
    name: "porter2-20-search",
    url: "/search?q=%ED%8F%AC%ED%84%B02%2020%EB%85%84%EC%8B%9D",
    test: (html) =>
      /2020년형\s*이후|2020년\s*이후/.test(html) &&
      /100R/.test(html) &&
      !html.includes("등록된 차량 규격 정보가 없습니다"),
  },
  {
    name: "porter2-2019-search",
    url: "/search?q=%ED%8F%AC%ED%84%B02%202019",
    test: (html) => /90R/.test(html) && (/2020년\s*이전|2019/.test(html) || /90R\s*\/\s*100R/.test(html)),
  },
  {
    name: "porter2-battery-search",
    url: "/search?q=%ED%8F%AC%ED%84%B02%20%EB%B0%B0%ED%84%B0%EB%A6%AC",
    test: (html) => /90R/.test(html) && /100R/.test(html),
  },
  {
    name: "sorento-fuel-hero-cards",
    url: "/vehicle/sorento-mq4",
    test: (html) =>
      html.includes("fuel-battery-hero-cards") &&
      html.includes("AGM70L") &&
      html.includes("AGM80L") &&
      html.includes("AGM60L") &&
      /가솔린/.test(html) &&
      /디젤/.test(html) &&
      /하이브리드/.test(html),
  },
  {
    name: "photo-page-structure",
    url: "/analysis/photo",
    test: (html) => {
      const titleCount = (html.match(/사진 3장으로 배터리 규격 확인/g) ?? []).length;
      const uploadIdx = html.indexOf("data-ux=\"photo-upload\"");
      const mistakesIdx = html.indexOf("data-ux=\"photo-mistakes\"");
      return (
        titleCount <= 1 &&
        html.includes("data-ux=\"photo-next-step\"") &&
        html.includes("data-ux=\"photo-examples\"") &&
        uploadIdx > 0 &&
        mistakesIdx > uploadIdx
      );
    },
  },
  {
    name: "agm60l-sorento-mq4-href",
    url: "/batteries/AGM60L",
    test: (html) => {
      const href = extractSorentoMq4HybridHref(html);
      if (!href) return false;
      const normalized = href.replace(/fuel=하이브리드/i, "fuel=%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C");
      return (
        href.includes("/vehicle/sorento-mq4") &&
        normalized.includes(EXPECTED_SORENTO_HYBRID_HREF.split("?")[1]) &&
        !html.includes('href="/vehicle/sorento-xm')
      );
    },
  },
  {
    name: "sorento-hybrid-footer-cta",
    url: "/vehicle/sorento-mq4?fuel=%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C",
    test: (html) => {
      const footer = html.match(/data-ux="vehicle-nav-footer"[\s\S]{0,2500}/)?.[0] ?? "";
      const firstSpec = footer.indexOf("/batteries/AGM60L");
      const first70 = footer.indexOf("/batteries/AGM70L");
      return (
        footer.includes("data-primary-battery=\"AGM60L\"") &&
        footer.includes("AGM60L 규격 상세") &&
        firstSpec >= 0 &&
        (first70 < 0 || firstSpec < first70)
      );
    },
  },
  {
    name: "search-sorento-hybrid-vehicle-href",
    url: "/search?q=%EC%8F%98%EB%A0%8C%ED%86%A0%20MQ4%20%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C",
    test: (html) =>
      html.includes("/vehicle/sorento-mq4") &&
      html.includes("fuel=%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C") &&
      !html.includes("/vehicle/sorento-xm"),
  },
  {
    name: "compare-agm70l-din74l-summary",
    url: "/compare?items=AGM70L,DIN74L",
    test: (html) =>
      /DIN74L.*4Ah|4Ah.*DIN74L/.test(html) &&
      /AGM70L.*80|80.*AGM70L/.test(html) &&
      /AGM.*DIN|DIN.*AGM/.test(html),
  },
  {
    name: "service-center-visual",
    url: "/service-center",
    test: (html) =>
      html.includes("매장 사진 준비 중") || html.includes("현장 사진 추가 예정"),
  },
  {
    name: "shop-bottom-once",
    url: "/shop",
    test: (html) => {
      const checklist = (html.match(/주문 전 체크리스트/g) ?? []).length;
      const compare = (html.match(/많이 비교한 규격/g) ?? []).length;
      const quick = (html.match(/빠른 이동/g) ?? []).length;
      const smart = (html.match(/바로 이어서 확인하기/g) ?? []).length;
      return (
        checklist === 1 &&
        compare === 1 &&
        quick === 1 &&
        smart === 0 &&
        html.includes("전체 배터리 규격") &&
        html.includes("data-ux=\"shop-page-bottom\"")
      );
    },
  },
];

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "BM-Production-Verify/1.0" },
    redirect: "follow",
  });
  return { status: res.status, html: await res.text() };
}

async function main() {
  console.log(`Base: ${BASE}`);
  console.log(`Expected version: ${VERSION}\n`);
  let failed = 0;
  for (const c of checks) {
    try {
      const { status, html } = await fetchHtml(c.url);
      const ok = status === 200 && c.test(html);
      console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}  (${status}) ${c.url}`);
      if (!ok) failed++;
    } catch (e) {
      console.log(`FAIL  ${c.name}  error: ${e.message}`);
      failed++;
    }
  }

  try {
    const { html } = await fetchHtml("/batteries/AGM60L");
    const href = extractSorentoMq4HybridHref(html);
    if (!href) {
      console.log("FAIL  agm60l-sorento-click-follow  no hybrid href in HTML");
      failed++;
    } else {
      const clickOk = await hrefDoesNotLandOnSorentoXm(href.startsWith("/") ? href : `/${href}`);
      console.log(
        `${clickOk ? "PASS" : "FAIL"}  agm60l-sorento-click-follow  href=${href} → not sorento-xm`,
      );
      if (!clickOk) failed++;
    }
  } catch (e) {
    console.log(`FAIL  agm60l-sorento-click-follow  error: ${e.message}`);
    failed++;
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
