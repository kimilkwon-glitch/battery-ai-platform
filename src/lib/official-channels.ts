/**
 * 공식 채널 UI 어댑터 — external-links 단일 소스
 */

import { officialChannels, storeLinks, type StoreLinkKey } from "@/lib/external-links";

export type OfficialChannelId =
  | "naver_place"
  | "naver_blog"
  | "naver_smartstore"
  | "daangn"
  | "instagram"
  | "youtube";

export type OfficialChannelStatus = "active" | "coming_soon";

export type OfficialChannel = {
  id: OfficialChannelId;
  label: string;
  shortLabel: string;
  href?: string;
  status: OfficialChannelStatus;
};

export const OFFICIAL_CHANNELS_TITLE = "공식 운영 채널";

export const SOCIAL_OFFICIAL_CHANNELS_SUBTITLE =
  "인스타그램·유튜브 채널을 준비 중입니다.";

function socialToChannel(id: "instagram" | "youtube"): OfficialChannel {
  const ch = officialChannels[id];
  const active = ch.status === "active" && ch.href;
  return {
    id,
    label: ch.label,
    shortLabel: id === "instagram" ? "인스타" : "유튜브",
    href: active ? ch.href! : undefined,
    status: active ? "active" : "coming_soon",
  };
}

export const SOCIAL_OFFICIAL_CHANNELS: OfficialChannel[] = [
  socialToChannel("instagram"),
  socialToChannel("youtube"),
];

export const OFFICIAL_CHANNELS = SOCIAL_OFFICIAL_CHANNELS;
export const OFFICIAL_CHANNELS_SUBTITLE = SOCIAL_OFFICIAL_CHANNELS_SUBTITLE;

export const SMARTSTORE_CHANNEL: OfficialChannel = {
  id: "naver_smartstore",
  label: "스마트스토어",
  shortLabel: "쇼핑몰",
  status: "active",
  href: "https://smartstore.naver.com/batterymanager",
};

export function storeChannelLinks(storeId: StoreLinkKey) {
  const s = storeLinks[storeId];
  return [
    { id: "naver_place" as const, label: "네이버 플레이스", href: s.naverPlace },
    { id: "naver_blog" as const, label: "블로그 사례", href: s.blog },
    { id: "daangn" as const, label: "당근", href: s.daangn },
  ];
}

/** @deprecated StoreOfficialChannelLinks(storeId) 사용 */
export function channelsForStoreCard(): OfficialChannel[] {
  return storeChannelLinks("deokcheon").map((l) => ({
    id: l.id,
    label: l.label,
    shortLabel: l.label,
    href: l.href,
    status: "active" as const,
  }));
}

export function getOfficialChannel(id: OfficialChannelId): OfficialChannel {
  if (id === "instagram" || id === "youtube") {
    return socialToChannel(id);
  }
  if (id === "naver_smartstore") return SMARTSTORE_CHANNEL;
  const first = storeChannelLinks("deokcheon").find((c) => c.id === id);
  if (first) {
    return {
      id: first.id,
      label: first.label,
      shortLabel: first.label,
      href: first.href,
      status: "active",
    };
  }
  throw new Error(`Unknown channel: ${id}`);
}
