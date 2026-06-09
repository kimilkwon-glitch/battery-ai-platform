const STAMP = "BM-ADMIN-CONSOLE-POLISH-20260530-V1";
const BASE = "https://battery-ai-platform.vercel.app";

const results = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`PASS ${name}: ${detail}`);
  } catch (e) {
    results.push({ name, ok: false, detail: String(e.message ?? e) });
    console.log(`FAIL ${name}: ${e.message ?? e}`);
  }
}

await check("admin redirect to login", async () => {
  const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  if (res.status !== 307 && res.status !== 302) throw new Error(`status ${res.status}`);
  if (!loc.includes("/admin/login")) throw new Error(`location ${loc}`);
  return `status=${res.status} location=${loc}`;
});

await check("admin login build stamp", async () => {
  const res = await fetch(`${BASE}/admin/login?cb=admin-console-v1`);
  const html = await res.text();
  const stamp = html.match(/data-build-version="([^"]+)"/)?.[1] ?? "not-found";
  if (!stamp.includes(STAMP)) throw new Error(`stamp=${stamp}`);
  return stamp;
});

await check("guest order page no dev banner", async () => {
  const res = await fetch(`${BASE}/guest-order?cb=admin-console-v1`);
  const html = await res.text();
  if (/localStorage|fallback|개발용/.test(html)) {
    throw new Error("dev wording visible on guest-order");
  }
  return "clean";
});

await check("guest order API create", async () => {
  const body = {
    customerName: "콘솔검수테스트",
    customerPhone: "01012345678",
    customerType: "guest",
    usedBatteryReturnOption: "return",
    confirmations: {
      fitmentNeedsFinalCheck: true,
      usedBatteryPriceMayDiffer: true,
      bankTransferDeadlineAware: true,
      orderWillBeGuidedSeparately: true,
    },
    vehicle: {
      name: "그랜저 IG",
      year: "2018",
      fuelType: "가솔린",
      currentBatterySpec: "CMF80L",
    },
    fulfillment: { method: "undecided" },
    items: [
      {
        id: "probe-item-1",
        batteryCode: "CMF80L",
        productName: "쏠라이트 CMF80L",
        brandName: "쏠라이트",
        quantity: 1,
        unitPrice: 0,
        vehicle: { displayName: "그랜저 IG", year: "2018", fuelType: "가솔린" },
        fitmentStatus: "needs_customer_confirm",
        usedBatteryReturnOption: "return",
        fulfillment: { method: "undecided" },
        source: "manual",
      },
    ],
    website: "",
    source: "guest_form",
  };
  const res = await fetch(`${BASE}/api/order-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  const rn = json.requestNumber ?? json.record?.requestNumber;
  if (!rn) throw new Error(`no requestNumber in ${JSON.stringify(json)}`);
  return rn;
});

const pass = results.filter((r) => r.ok).length;
console.log(`\nSummary: ${pass}/${results.length} passed (stamp ${STAMP})`);
process.exit(pass === results.length ? 0 : 1);
