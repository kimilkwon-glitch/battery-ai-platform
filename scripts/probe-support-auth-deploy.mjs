const base = "https://battery-ai-platform.vercel.app";
const pages = ["/login", "/signup", "/support"];

for (const path of pages) {
  const html = await (await fetch(`${base}${path}`)).text();
  const stamp =
    html.match(/data-build-version="([^"]+)"/)?.[1] ??
    html.match(/BM-[A-Z0-9-]+-V1/)?.[0] ??
    "none";
  console.log(`\n=== ${path}`);
  console.log("stamp:", stamp);
  console.log("photo CTA:", /사진으로 배터리 확인|사진 확인하기|사진으로 확인/.test(html));
  if (path === "/support") {
    console.log("layout:", html.includes("support-hub-v2__layout"));
    console.log("sidebar:", html.includes("support-hub-v2__sidebar"));
    console.log("faq more:", html.includes("자주 묻는 질문 더보기"));
    console.log("info box:", html.includes("support-hub-v2__info"));
    console.log("cta count consult+lookup:", (html.match(/상담 문의하기/g) ?? []).length, (html.match(/주문 조회하기/g) ?? []).length);
  }
  if (path === "/login" || path === "/signup") {
    console.log("guest order:", html.includes("비회원 주문"));
    console.log("guest lookup:", html.includes("비회원 주문조회"));
  }
}
