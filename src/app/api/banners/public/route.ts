import { NextResponse } from "next/server";
import { mainBannerToHeroSlide, mainBannerToPublic } from "@/lib/cms/cms-mappers";
import { listActiveMainBanners } from "@/lib/cms/main-banner-store.postgres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const banners = await listActiveMainBanners();
    return NextResponse.json({
      ok: true,
      items: banners.map(mainBannerToPublic),
      slides: banners.map(mainBannerToHeroSlide),
    });
  } catch {
    return NextResponse.json({ ok: false, items: [], slides: [] }, { status: 500 });
  }
}
