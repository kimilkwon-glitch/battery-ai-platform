/**
 * UX2 운영검수 30명 페르소나 시드 (기존 Postgres store 재사용)
 * npm run ux2:seed
 */
import "./register-server-only.mjs";
import { existsSync, readFileSync } from "node:fs";
import {
  UX2_ADMIN_MEMO,
  formatUx2CustomerName,
  formatUx2Email,
  formatUx2Phone,
  formatUx2RequestMemo,
} from "../src/lib/admin/ux2-admin-review-marker";
import { computeServerOrderAmount } from "../src/lib/payment/compute-order-amount";
import type { BatteryCartItem } from "../src/types/cart";
import type { CommerceOrderRecord } from "../src/types/commerce-payment";
import type { OrderRequestFulfillmentMethod } from "../src/types/order-request";
import { buildUx2Personas, storeForPersona, type Ux2Persona } from "./ux2-persona-definitions";

function loadEnvLocal(): void {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

function buildCartItem(persona: Ux2Persona): BatteryCartItem {
  return {
    id: `cart_${persona.id}`,
    productId: persona.batteryCode,
    productName: `${persona.brandName} ${persona.batteryCode} 자동차 배터리`,
    brandName: persona.brandName,
    batterySpec: persona.batteryCode,
    quantity: 1,
    fitmentStatus: persona.specConfidence === "confirmed" ? "confirmed" : "needs_customer_confirm",
    usedBatteryReturn: {
      option: persona.returnBattery,
      guideRequired: persona.returnBattery === "no_return",
    },
    fulfillment: { method: persona.fulfillment },
    vehicle: {
      displayName: persona.vehicle,
      year: persona.year,
      fuelType: persona.fuel,
    },
  };
}

function orderNumberFor(persona: Ux2Persona, date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `BM-UX2-${y}${m}${d}-${String(persona.seq).padStart(4, "0")}`;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const personas = buildUx2Personas();
  const pgOrder = await import("../src/lib/payment/commerce-order-store.postgres");
  const pgMeta = await import("../src/lib/admin/commerce-order-admin-meta-store.postgres");
  const pgTalk = await import("../src/lib/battery-talk/battery-talk-store.postgres");
  const pgInquiry = await import("../src/lib/inquiry/inquiry-store.postgres");
  const pgClaim = await import("../src/lib/claims/claim-store.postgres");

  const stats = {
    orders: 0,
    batteryTalkSessions: 0,
    batteryTalkMessages: 0,
    inquiries: 0,
    productQna: 0,
    claims: 0,
    errors: [] as string[],
    orderNumbers: [] as string[],
  };

  for (const persona of personas) {
    try {
      const items = [buildCartItem(persona)];
      const amounts = computeServerOrderAmount(
        items,
        persona.fulfillment as OrderRequestFulfillmentMethod,
        persona.returnBattery,
      );
      if (amounts.finalAmount == null) {
        stats.errors.push(`${persona.id}: 금액 계산 실패 (${persona.batteryCode})`);
        continue;
      }

      const now = new Date().toISOString();
      const orderId = `co_ux2_${String(persona.seq).padStart(3, "0")}_${Date.now()}`;
      const orderNumber = orderNumberFor(persona, new Date());
      const storeId = storeForPersona(persona);
      const memoNote = persona.specNote ?? persona.scenarioSummary;

      const record: CommerceOrderRecord = {
        orderId,
        orderNumber,
        orderStatus: "payment_pending",
        paymentStatus: "not_started",
        customerName: formatUx2CustomerName(persona.name, persona.id),
        customerPhone: formatUx2Phone(persona.seq),
        customerEmail: formatUx2Email(persona.seq),
        customerType: "guest",
        vehicleName: persona.vehicle,
        vehicleYear: persona.year,
        vehicleFuel: persona.fuel,
        productName: items[0]!.productName,
        brand: persona.brandName,
        batteryCode: persona.batteryCode,
        internetPrice: amounts.internetPrice,
        onsitePrice: amounts.onsitePrice,
        fulfillmentType: persona.fulfillment,
        returnBatteryOption: persona.returnBattery,
        deliveryFee: amounts.deliveryFee,
        storeInstallDiscount: amounts.storeInstallDiscount,
        batteryReturnFee: amounts.batteryReturnFee,
        finalAmount: amounts.finalAmount,
        address:
          persona.fulfillment === "delivery"
            ? "부산시 해운대구 UX2검수로 1"
            : persona.fulfillment === "visit_install"
              ? "부산시 수영구 UX2검수길 30"
              : undefined,
        store: storeId ? (storeId === "deokcheon" ? "덕천점" : "학장점") : undefined,
        selectedStore: storeId,
        requestMemo: formatUx2RequestMemo(persona.id, persona.acquisitionChannel, memoNote),
        itemsJson: items,
        priceLines: amounts.priceLines,
        statusHistory: [
          {
            status: "payment_pending",
            paymentStatus: "not_started",
            note: "UX2 운영검수 시뮬레이션, PG/Toss 미호출",
            at: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const saved = await pgOrder.pgStoreCommerceOrderCreate(record);
      if (persona.orderStatus !== "payment_pending" || persona.paymentStatus !== "not_started") {
        await pgOrder.pgStoreCommerceOrderUpdate(saved.orderId, {
          orderStatus: persona.orderStatus,
          paymentStatus: persona.paymentStatus,
          statusHistory: [
            {
              status: persona.orderStatus,
              paymentStatus: persona.paymentStatus,
              note: "UX2 운영검수 상태 시뮬레이션 (실결제 아님)",
              at: now,
            },
          ],
        });
      }

      const adminMemoParts = [
        UX2_ADMIN_MEMO,
        persona.priorityToday ? "오늘처리우선" : null,
        persona.phoneCallbackNeeded ? "전화콜백필요" : null,
        persona.returnBattery === "no_return" ? "미반납" : null,
      ].filter(Boolean);

      await pgMeta.commerceOrderAdminMetaUpsert(saved.orderId, {
        adminMemo: adminMemoParts.join(" · "),
      });

      stats.orders += 1;
      stats.orderNumbers.push(orderNumber);
      const refreshed = (await pgOrder.pgStoreCommerceOrderGet(saved.orderId))!;

      if (persona.features.includes("battery_talk") && persona.batteryTalkMessage) {
        const thread = await pgTalk.batteryTalkOpenThread({
          customerName: formatUx2CustomerName(persona.name, persona.id),
          phone: formatUx2Phone(persona.seq),
          context: {
            pageUrl: `https://www.batterymanager.co.kr/batteries/${persona.batteryCode}`,
            pageType: "product",
            batteryCode: persona.batteryCode,
            productCode: persona.batteryCode,
            productName: items[0]!.productName,
            vehicleName: persona.vehicle,
            orderNumber: orderNumber,
          },
        });
        await pgTalk.batteryTalkUpdateMemo(thread.threadId, UX2_ADMIN_MEMO);
        const withCustomer = await pgTalk.batteryTalkAddCustomerMessage(
          thread.threadId,
          persona.batteryTalkMessage,
          {
            phone: formatUx2Phone(persona.seq),
            customerName: formatUx2CustomerName(persona.name, persona.id),
          },
        );
        if (persona.adminReply) {
          await pgTalk.batteryTalkAddAdminMessage(thread.threadId, persona.adminReply);
        }
        stats.batteryTalkSessions += 1;
        stats.batteryTalkMessages += withCustomer?.messages.length ?? 0;
      }

      if (persona.features.includes("inquiry") && persona.inquiryMessage) {
        const inq = await pgInquiry.inquiryCreate({
          name: formatUx2CustomerName(persona.name, persona.id),
          contact: formatUx2Phone(persona.seq),
          vehicle: `${persona.vehicle} ${persona.year} ${persona.fuel}`,
          message: persona.inquiryMessage,
          batteryCode: persona.batteryCode,
          productCode: persona.batteryCode,
          productName: items[0]!.productName,
          source: "support",
          category: persona.inquiryCategory === "spec" ? "battery" : (persona.inquiryCategory ?? "other"),
          inquiryType: "상담문의",
        });
        await pgInquiry.inquiryUpdateMemo(inq.id, UX2_ADMIN_MEMO);
        stats.inquiries += 1;
      }

      if (persona.features.includes("product_qna") && persona.productQnaMessage) {
        const inq = await pgInquiry.inquiryCreate({
          name: formatUx2CustomerName(persona.name, persona.id),
          contact: formatUx2Phone(persona.seq),
          vehicle: persona.vehicle,
          message: persona.productQnaMessage,
          batteryCode: persona.batteryCode,
          productCode: persona.batteryCode,
          productName: items[0]!.productName,
          source: "product_qna",
          category: "battery",
          inquiryType: "상품문의",
        });
        await pgInquiry.inquiryUpdateMemo(inq.id, UX2_ADMIN_MEMO);
        stats.productQna += 1;
      }

      if (persona.features.includes("claim") && persona.claimType && persona.claimMessage) {
        await pgClaim.claimCreate({
          order: refreshed,
          claimType: persona.claimType,
          reasonCode: persona.claimReason ?? "other",
          reasonText: UX2_ADMIN_MEMO,
          customerMessage: persona.claimMessage,
          customerName: formatUx2CustomerName(persona.name, persona.id),
          customerPhone: formatUx2Phone(persona.seq),
        });
        stats.claims += 1;
      }
    } catch (e) {
      stats.errors.push(`${persona.id}: ${(e as Error)?.message ?? e}`);
    }
  }

  console.log(JSON.stringify({ personas: personas.length, ...stats }, null, 2));
  if (stats.errors.length) process.exit(1);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
