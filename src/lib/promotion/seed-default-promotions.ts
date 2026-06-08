import "server-only";
import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db/postgres";

const FIRST_ORDER_PROMO_ID = "promo_first_order_3pct";

export async function seedDefaultPromotions(): Promise<void> {
  const sql = getSql();
  const existing = (await sql`
    SELECT id FROM promotions WHERE id = ${FIRST_ORDER_PROMO_ID} LIMIT 1
  `) as { id: string }[];

  if (existing[0]) return;

  const now = new Date().toISOString();
  await sql`
    INSERT INTO promotions (
      id, title, description, status, type, discount_type, discount_value,
      max_discount_amount, min_order_amount, first_order_only, new_member_only,
      member_only, stackable, priority, show_on_main, show_on_benefits_page,
      badge_text, image_url, banner_image_url, created_at, updated_at
    ) VALUES (
      ${FIRST_ORDER_PROMO_ID},
      ${"회원가입 첫 주문 3% 자동 혜택"},
      ${"로그인 후 첫 주문 시 자동으로 적용됩니다."},
      ${"active"},
      ${"automatic"},
      ${"percent"},
      ${3},
      ${null},
      ${null},
      ${true},
      ${true},
      ${true},
      ${false},
      ${100},
      ${true},
      ${true},
      ${"첫 주문 3%"},
      ${"/assets/benefits/first-order-3-card.png"},
      ${"/assets/benefits/first-order-3-banner.png"},
      ${now}::timestamptz,
      ${now}::timestamptz
    )
  `;
}

export function generatePromotionId(): string {
  return `promo_${Date.now()}_${randomBytes(4).toString("hex")}`;
}
