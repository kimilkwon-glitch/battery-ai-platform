import fs from "node:fs";
import path from "node:path";
import { vehicleAssets } from "@/lib/car-assets";
import { HERO_SLIDES } from "@/lib/hero-slides-data";
import { BENEFIT_CARDS } from "@/lib/benefits-data";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";
import { BASE_BATTERY_SPECS } from "@/data/battery/baseSpecs";
import type { AdminAssetRow } from "@/types/admin";

function fileExists(publicPath: string): boolean {
  const rel = publicPath.split("?")[0]!.replace(/^\//, "");
  return fs.existsSync(path.join(process.cwd(), "public", rel));
}

export function buildAdminAssetRows(): AdminAssetRow[] {
  const rows: AdminAssetRow[] = [];

  for (const asset of vehicleAssets) {
    const rel = asset.image.replace(/^\//, "").split("?")[0]!;
    rows.push({
      category: "차량 이미지",
      fileName: asset.imageFile,
      targetLabel: asset.displayName,
      path: asset.image,
      device: "both",
      exists: fileExists(asset.image),
      previewPath: asset.image,
      usedOnPages: [`/vehicle/${asset.id}`, "/search"],
      missing: !fileExists(asset.image),
    });
  }

  for (const slide of HERO_SLIDES) {
    if (slide.type !== "image") continue;
    rows.push(
      {
        category: "메인배너",
        fileName: slide.image.split("/").pop()?.split("?")[0] ?? slide.id,
        targetLabel: slide.title,
        path: slide.image,
        device: "pc",
        exists: fileExists(slide.image),
        previewPath: slide.image,
        usedOnPages: ["/"],
        missing: !fileExists(slide.image),
        aspectIssue: "1920×820 또는 1916×821 기준",
      },
      {
        category: "메인배너",
        fileName: (slide.imageMobile ?? slide.image).split("/").pop()?.split("?")[0] ?? slide.id,
        targetLabel: `${slide.title} (모바일)`,
        path: slide.imageMobile ?? slide.image,
        device: "mobile",
        exists: fileExists(slide.imageMobile ?? slide.image),
        previewPath: slide.imageMobile ?? slide.image,
        usedOnPages: ["/"],
        missing: !fileExists(slide.imageMobile ?? slide.image),
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
        exists: fileExists(card.image),
        previewPath: card.image,
        usedOnPages: ["/", card.href],
        missing: !fileExists(card.image),
        aspectIssue: "1280×720 또는 1600×900 기준",
      },
      {
        category: "혜택 이미지",
        fileName: (card.imageMobile ?? card.image).split("/").pop()?.split("?")[0] ?? card.id,
        targetLabel: `${card.title} (모바일)`,
        path: card.imageMobile ?? card.image,
        device: "mobile",
        exists: fileExists(card.imageMobile ?? card.image),
        previewPath: card.imageMobile ?? card.image,
        usedOnPages: ["/", card.href],
        missing: !fileExists(card.imageMobile ?? card.image),
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
      exists: fileExists(icon.imageSrc),
      previewPath: icon.imageSrc,
      usedOnPages: ["/"],
      missing: !fileExists(icon.imageSrc),
    });
  }

  for (const spec of BASE_BATTERY_SPECS.slice(0, 20)) {
    rows.push({
      category: "배터리 이미지",
      fileName: `${spec.code}.png`,
      targetLabel: spec.code,
      path: `/assets/batteries/${spec.code.toLowerCase()}.png`,
      device: "both",
      exists: fileExists(`/assets/batteries/${spec.code.toLowerCase()}.png`),
      usedOnPages: [`/batteries/${spec.code}`],
      missing: !fileExists(`/assets/batteries/${spec.code.toLowerCase()}.png`),
    });
  }

  return rows;
}
