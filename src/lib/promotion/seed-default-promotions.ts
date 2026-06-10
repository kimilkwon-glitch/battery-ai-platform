import "server-only";
import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db/postgres";
import { DEFAULT_PROMOTION_SEEDS } from "@/lib/promotion/default-promotions";

export async function seedDefaultPromotions(): Promise<void> {
  const sql = getSql();
  const now = new Date().toISOString();

  for (const seed of DEFAULT_PROMOTION_SEEDS) {
    const existing = (await sql`
      SELECT id FROM promotions WHERE id = ${seed.id} LIMIT 1
    `) as { id: string }[];

    if (existing[0]) continue;

    await sql`
      INSERT INTO promotions (
        id, title, description, status, type, discount_type, discount_value,
        max_discount_amount, min_order_amount, first_order_only, new_member_only,
        member_only, stackable, priority, show_on_main, show_on_benefits_page,
        badge_text, image_url, banner_image_url, allowed_fulfillment_types,
        created_at, updated_at
      ) VALUES (
        ${seed.id},
        ${seed.title},
        ${seed.description},
        ${seed.status},
        ${seed.type},
        ${seed.discountType},
        ${seed.discountValue},
        ${seed.maxDiscountAmount},
        ${seed.minOrderAmount},
        ${seed.firstOrderOnly},
        ${seed.newMemberOnly},
        ${seed.memberOnly},
        ${seed.stackable},
        ${seed.priority},
        ${seed.showOnMain},
        ${seed.showOnBenefitsPage},
        ${seed.badgeText},
        ${seed.imageUrl},
        ${seed.bannerImageUrl},
        ${JSON.stringify(seed.allowedFulfillmentTypes ?? [])}::jsonb,
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `;
  }
}

export function generatePromotionId(): string {
  return `promo_${Date.now()}_${randomBytes(4).toString("hex")}`;
}
