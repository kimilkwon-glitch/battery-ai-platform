import { HERO_SLIDES } from "@/lib/hero-slides-data";
import { BENEFIT_CARDS } from "@/lib/benefits-data";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";
import { BASE_BATTERY_SPECS } from "@/data/battery/baseSpecs";
import type { AdminAssetRow } from "@/types/admin";

/** 서버리스 번들 크기 제한 — 파일 존재 여부는 경로 기준 표시 (런타임 fs 미사용) */
export function buildAdminAssetRows(): AdminAssetRow[] {
  const rows: AdminAssetRow[] = [];

  for (const slide of HERO_SLIDES) {
    if (slide.type !== "image") continue;
    rows.push(
      {
        category: "메인배너",
        fileName: slide.image.split("/").pop()?.split("?")[0] ?? slide.id,
        targetLabel: slide.title,
        path: slide.image,
        device: "pc",
        exists: true,
        previewPath: slide.image,
        usedOnPages: ["/"],
        missing: false,
        aspectIssue: "1920×820 또는 1916×821 기준",
      },
      {
        category: "메인배너",
        fileName: (slide.imageMobile ?? slide.image).split("/").pop()?.split("?")[0] ?? slide.id,
        targetLabel: `${slide.title} (모바일)`,
        path: slide.imageMobile ?? slide.image,
        device: "mobile",
        exists: true,
        previewPath: slide.imageMobile ?? slide.image,
        usedOnPages: ["/"],
        missing: false,
        aspectIssue: "900×562 또는 800×500 기준",
      },
    );
  }

  for (const card of BENEFIT_CARDS) {
    if (!card.image) continue;
    rows.push(
      {
        category: "혜택 이미지",
        fileName: card.image.split("/").pop()?.split("?")[0] ?? card.id,
        targetLabel: card.title,
        path: card.image,
        device: "pc",
        exists: true,
        previewPath: card.image,
        usedOnPages: ["/", card.href],
        missing: false,
        aspectIssue: "1280×720 또는 1600×900 기준",
      },
      {
        category: "혜택 이미지",
        fileName: (card.imageMobile ?? card.image).split("/").pop()?.split("?")[0] ?? card.id,
        targetLabel: `${card.title} (모바일)`,
        path: card.imageMobile ?? card.image,
        device: "mobile",
        exists: true,
        previewPath: card.imageMobile ?? card.image,
        usedOnPages: ["/", card.href],
        missing: false,
      },
    );
  }

  for (const icon of HOME_QUICK_ICON_ITEMS) {
    rows.push({
      category: "빠른메뉴 아이콘",
      fileName: icon.imageSrc.split("/").pop()?.split("?")[0] ?? icon.id,
      targetLabel: icon.label,
      path: icon.imageSrc,
      device: "both",
      exists: true,
      previewPath: icon.imageSrc,
      usedOnPages: ["/"],
      missing: false,
    });
  }

  for (const spec of BASE_BATTERY_SPECS.slice(0, 30)) {
    rows.push({
      category: "배터리 이미지",
      fileName: `${spec.code}.png`,
      targetLabel: spec.code,
      path: `/assets/batteries/${spec.code.toLowerCase()}.png`,
      device: "both",
      exists: false,
      usedOnPages: [`/batteries/${spec.code}`],
      missing: true,
    });
  }

  rows.push({
    category: "차량 이미지",
    fileName: "(car-assets registry)",
    targetLabel: "전체 차량 에셋",
    path: "/assets/cars/",
    device: "both",
    exists: true,
    usedOnPages: ["/search", "/vehicle/*"],
    missing: false,
    aspectIssue: "차량별 상세는 차량 DB 관리에서 확인",
  });

  return rows;
}
