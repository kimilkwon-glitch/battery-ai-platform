const STAMP = "BM-CUSTOMER-AUTH-LOGIN-SIGNUP-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";
const paths = ["/", "/login", "/signup", "/mypage", "/guest-order/check"];

let pass = 0;
for (const p of paths) {
  const url = `${BASE}${p}?cb=auth-v1`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";
  const stampOk = stamp.includes("BM-CUSTOMER-AUTH-LOGIN-SIGNUP");
  const loginUi =
    p === "/login"
      ? html.includes("네이버로 계속하기") &&
        html.includes("배터리매니저 계정으로 로그인") &&
        html.includes("첫 주문 3% 혜택 자동 적용")
      : true;
  const signupUi =
    p === "/signup"
      ? html.includes("회원가입 완료") && html.includes("개인정보 수집 및 이용")
      : true;
  const headerLogin = p === "/" ? html.includes("로그인") && html.includes("회원가입") : true;
  const ok = res.status === 200 && stampOk && loginUi && signupUi && headerLogin;
  if (ok) pass++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${res.status} ${p} stamp=${stamp}${p === "/login" ? ` social=${loginUi}` : ""}`,
  );
}
console.log(`\nSummary: ${pass}/${paths.length} (expected ${STAMP})`);
