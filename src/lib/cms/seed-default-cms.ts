import "server-only";
import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db/postgres";
import { HERO_SLIDES } from "@/lib/hero-slides-data";
import { HOME_REPLACEMENT_STORY_CARDS } from "@/lib/home-replacement-stories-data";
import { REVIEWS_MOCK } from "@/lib/reviews-mock-data";

export function generateCmsId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export async function seedDefaultCmsContent(): Promise<void> {
  const sql = getSql();

  const bannerCount = (await sql`SELECT COUNT(*)::int AS cnt FROM main_banners`) as {
    cnt: number;
  }[];
  if ((bannerCount[0]?.cnt ?? 0) === 0) {
    const now = new Date().toISOString();
    let order = HERO_SLIDES.length;
    for (const slide of HERO_SLIDES) {
      if (slide.type !== "image") continue;
      const id = `banner_${slide.id}`;
      await sql`
        INSERT INTO main_banners (
          id, title, subtitle, description, image_url, mobile_image_url, link_url,
          promo_label, image_alt, status, sort_order, show_on_main, created_at, updated_at
        ) VALUES (
          ${id},
          ${slide.title},
          ${slide.heading},
          ${slide.description},
          ${slide.image},
          ${slide.imageMobile ?? null},
          ${slide.href},
          ${slide.promoLabel},
          ${slide.imageAlt},
          ${"active"},
          ${order},
          ${true},
          ${now}::timestamptz,
          ${now}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `;
      order -= 1;
    }
  }

  const reviewCount = (await sql`SELECT COUNT(*)::int AS cnt FROM customer_reviews`) as {
    cnt: number;
  }[];
  if ((reviewCount[0]?.cnt ?? 0) === 0) {
    const now = new Date().toISOString();

    for (const story of HOME_REPLACEMENT_STORY_CARDS) {
      const id = `review_${story.id}`;
      await sql`
        INSERT INTO customer_reviews (
          id, author_name, vehicle_name, rating, content, summary,
          home_badges_json, work_info_json, status, featured, show_on_main,
          sort_order, created_at, updated_at
        ) VALUES (
          ${id},
          ${story.authorLabel},
          ${story.vehicleLabel},
          ${story.rating},
          ${story.quote},
          ${story.quote},
          ${JSON.stringify(story.badges)}::jsonb,
          ${JSON.stringify(story.workInfo)}::jsonb,
          ${"active"},
          ${true},
          ${true},
          ${100},
          ${now}::timestamptz,
          ${now}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    let sort = 50;
    for (const r of REVIEWS_MOCK) {
      const id = `review_${r.id}`;
      await sql`
        INSERT INTO customer_reviews (
          id, author_name, vehicle_name, branch_name, service_type, battery_code,
          rating, content, summary, images_json, badges_json, operator_reply,
          operator_summary, product_href, status, featured, show_on_main, sort_order,
          created_at, updated_at
        ) VALUES (
          ${id},
          ${r.customerName ?? "고객"},
          ${r.vehicleName ?? null},
          ${r.branchName ?? null},
          ${r.serviceType ?? null},
          ${r.batteryCode ?? null},
          ${r.rating},
          ${r.content},
          ${r.content.slice(0, 80)},
          ${JSON.stringify(r.images ?? [])}::jsonb,
          ${JSON.stringify(r.badges)}::jsonb,
          ${r.operatorReply ?? null},
          ${r.operatorSummary ?? null},
          ${r.productHref},
          ${"active"},
          ${false},
          ${false},
          ${sort},
          ${r.createdAt ?? now}::timestamptz,
          ${now}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `;
      sort -= 1;
    }
  }
}
