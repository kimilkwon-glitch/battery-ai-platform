const STAMP = process.argv[3] || "BM-UX-REV-20260528-BRAND-SERVICE-V1";
const BASE = process.argv[2] || "https://battery-ai-platform.vercel.app";
const cb = Date.now();

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}?_cb=${cb}`, {
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return { status: res.status, html: await res.text() };
}

const [home, brands, service] = await Promise.all([
  fetchHtml("/"),
  fetchHtml("/brands?brand=rocket"),
  fetchHtml("/service-center"),
]);

const checks = {
  stampOk: home.html.includes(STAMP),
  buildVersion: home.html.match(/data-build-version="([^"]+)"/)?.[1] ?? "—",
  brands: {
    status: brands.status,
    hasNotationTable: brands.html.includes("브랜드별 규격 표기 차이"),
    hasGb80: brands.html.includes("GB80L"),
    hasCmf80: brands.html.includes("CMF80L"),
    hasMainCard: brands.html.includes("brand-hub-main-card") || brands.html.includes("로케트"),
    hasMoreFold: brands.html.includes("더 알아보기"),
    noLongVehicleGrid: !brands.html.includes("자주 함께 확인되는 차량"),
  },
  service: {
    status: service.status,
    hasNeighborhoodSearch:
      service.html.includes("가까운 지점 확인") && service.html.includes("화명동"),
    hasMap: service.html.includes("busan-region-map") || service.html.includes("부산 권역 안내"),
    hasDeokcheonRegions: service.html.includes("북구 · 대저1동 · 금정 · 연제"),
    hasHakjangRegions: service.html.includes("사상 · 사하 · 강서 · 명지"),
    hasVisitPrep: service.html.includes("방문·출장 전 알려주시면 좋은 정보"),
    noSection6: !service.html.includes("6. 문의하기"),
    noPhotoPrimary: !service.html.match(/사진으로 확인[\s\S]{0,80}btnPrimary/),
  },
};

console.log(JSON.stringify(checks, null, 2));
