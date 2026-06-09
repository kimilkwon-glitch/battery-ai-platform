const BASE = "http://localhost:3000";

const body = {
  customerName: "로컬검수테스트",
  customerPhone: "01098765432",
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
      batterySpec: "CMF80L",
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

const createRes = await fetch(`${BASE}/api/order-requests`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const createJson = await createRes.json();
console.log("create", createRes.status, createJson);
if (!createRes.ok) process.exit(1);

const rn = createJson.request?.requestNumber;
const listRes = await fetch(`${BASE}/api/admin/order-requests`, { redirect: "manual" });
console.log("admin list unauth", listRes.status, listRes.headers.get("location"));

process.exit(0);
