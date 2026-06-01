/**
 * 상담 주문 요청 API 간단 검수 (dev 서버 필요: npm run dev)
 * node scripts/test-order-request-api.mjs [baseUrl]
 */
const base = process.argv[2] ?? "http://localhost:3000";
const adminKey =
  process.env.ADMIN_ACCESS_KEY ??
  process.env.ADMIN_API_SECRET ??
  "battery-manager-admin";

const sampleItem = {
  id: "test-item-1",
  batterySpec: "L2-560",
  productName: "테스트 배터리",
  quantity: 1,
  terminalDirection: "L",
  fitmentStatus: "confirmed",
  usedBatteryReturn: { option: "return", label: "반납" },
  fulfillment: { method: "delivery" },
};

const body = {
  customerName: "API테스트",
  customerPhone: "010-1234-5678",
  items: [sampleItem],
  usedBatteryReturnOption: "return",
  fulfillment: { method: "delivery" },
  confirmations: {
    fitmentNeedsFinalCheck: true,
    usedBatteryPriceMayDiffer: true,
    bankTransferDeadlineAware: true,
    orderWillBeGuidedSeparately: true,
  },
  website: "",
};

async function main() {
  console.log("POST", `${base}/api/order-requests`);
  const postRes = await fetch(`${base}/api/order-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const postJson = await postRes.json();
  console.log("status", postRes.status, postJson);
  if (!postRes.ok || !postJson.ok) process.exit(1);

  const id = postJson.request.id;
  console.log("\nGET admin list (no auth, expect 401)");
  const listDenied = await fetch(`${base}/api/admin/order-requests`);
  console.log("status", listDenied.status);
  if (listDenied.status !== 401) process.exit(1);

  console.log("\nGET admin list (x-admin-key)");
  const listRes = await fetch(`${base}/api/admin/order-requests`, {
    headers: { "x-admin-key": adminKey },
  });
  const listJson = await listRes.json();
  console.log("status", listRes.status, "count", listJson.items?.length);
  if (!listRes.ok) process.exit(1);

  console.log("\nGET admin detail", id);
  const detailRes = await fetch(
    `${base}/api/admin/order-requests/${encodeURIComponent(id)}`,
    { headers: { "x-admin-key": adminKey } },
  );
  const detailJson = await detailRes.json();
  console.log("status", detailRes.status, detailJson.record?.requestNumber);
  if (!detailRes.ok) process.exit(1);

  console.log("\nPATCH status contacted");
  const patchRes = await fetch(
    `${base}/api/admin/order-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ status: "contacted", internalMemo: "API 테스트 메모" }),
    },
  );
  const patchJson = await patchRes.json();
  console.log("status", patchRes.status, patchJson.record?.status);
  if (!patchRes.ok) process.exit(1);

  console.log("\nPOST lookup (same phone)");
  const lookupRes = await fetch(`${base}/api/order-requests/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestNumber: postJson.request.requestNumber,
      phone: "010-1234-5678",
      website: "",
    }),
  });
  const lookupJson = await lookupRes.json();
  console.log("status", lookupRes.status, lookupJson.lookup?.statusLabel);
  if (!lookupRes.ok) process.exit(1);

  console.log("\nPOST lookup wrong phone (expect 404)");
  const badLookup = await fetch(`${base}/api/order-requests/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestNumber: postJson.request.requestNumber,
      phone: "010-9999-9999",
      website: "",
    }),
  });
  console.log("status", badLookup.status);
  if (badLookup.status !== 404) process.exit(1);

  console.log("\nOK — API 검수 통과");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
