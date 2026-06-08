import { HUB_REVIEWS } from "@/lib/customer-hub-routes";
import type { HeroSlide } from "@/lib/hero-slides-data";
import type { HomeReplacementStoryCard } from "@/lib/home-replacement-stories-data";
import type { ReviewItem } from "@/lib/reviews-mock-data";
import { batterySpecHref } from "@/lib/canonical-battery-code";
import type { CustomerReviewRecord } from "@/types/customer-review";
import type { MainBannerRecord, PublicMainBanner } from "@/types/main-banner";

export function mainBannerToHeroSlide(banner: MainBannerRecord): HeroSlide {
  if (banner.imageUrl) {
    return {
      id: banner.id,
      type: "image",
      title: banner.title,
      heading: banner.subtitle ?? banner.title,
      description: banner.description ?? "",
      imageAlt: banner.imageAlt ?? banner.title,
      image: banner.imageUrl,
      imageMobile: banner.mobileImageUrl ?? undefined,
      href: banner.linkUrl,
      promoLabel: banner.promoLabel ?? "PROMO",
    };
  }
  return {
    id: banner.id,
    type: "placeholder",
    title: banner.title,
    subtitle: banner.subtitle ?? banner.description ?? "",
    href: banner.linkUrl,
  };
}

export function mainBannerToPublic(banner: MainBannerRecord): PublicMainBanner {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    description: banner.description,
    imageUrl: banner.imageUrl,
    mobileImageUrl: banner.mobileImageUrl,
    linkUrl: banner.linkUrl,
    buttonText: banner.buttonText,
    promoLabel: banner.promoLabel,
    imageAlt: banner.imageAlt,
  };
}

export function reviewToStoryCard(record: CustomerReviewRecord): HomeReplacementStoryCard {
  const badges = record.homeBadges;
  const badgePair: [string, string] = [
    badges[0] ?? "실제 교체 후기",
    badges[1] ?? "고객 만족",
  ];
  const href = record.batteryCode
    ? `${HUB_REVIEWS}?battery=${encodeURIComponent(record.batteryCode)}`
    : HUB_REVIEWS;

  return {
    id: record.id,
    authorLabel: record.authorName,
    vehicleLabel: record.vehicleName ?? "차량 정보",
    rating: record.rating,
    quote: record.summary ?? record.content,
    badges: badgePair,
    workInfo: record.workInfo ?? {
      placeLine: record.branchName ?? record.serviceType ?? "배터리매니저",
      vehicleLine: record.vehicleName ?? "—",
      batteryLine: record.batteryCode ?? "—",
      servicesLine: record.serviceType ?? "배터리 교체",
    },
    href,
  };
}

export function reviewToReviewItem(record: CustomerReviewRecord): ReviewItem {
  return {
    id: record.id,
    rating: record.rating,
    customerName: record.authorName,
    vehicleName: record.vehicleName ?? undefined,
    branchName: record.branchName as ReviewItem["branchName"],
    serviceType: record.serviceType as ReviewItem["serviceType"],
    batteryCode: record.batteryCode ?? undefined,
    content: record.content,
    images: record.images.length ? record.images : record.imageUrl ? [record.imageUrl] : undefined,
    createdAt: record.createdAt.slice(0, 10),
    badges: record.badges,
    operatorReply: record.operatorReply ?? undefined,
    operatorSummary: record.operatorSummary ?? undefined,
    productHref: record.productHref ?? (record.batteryCode ? batterySpecHref(record.batteryCode) : "/reviews"),
  };
}
