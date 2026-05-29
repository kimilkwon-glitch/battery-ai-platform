/**
 * 채널 링크 분리 — 공식 SNS / 지점 / 쇼핑
 * TODO: URL 확정 시 각 채널 href·status: active 설정
 */

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

/** floating·푸터 공식 채널 — 인스타·유튜브만 */
export const SOCIAL_OFFICIAL_CHANNELS_SUBTITLE =
  "인스타그램·유튜브 채널을 준비 중입니다.";

export const SOCIAL_OFFICIAL_CHANNELS: OfficialChannel[] = [
  {
    id: "instagram",
    label: "인스타그램",
    shortLabel: "인스타",
    status: "coming_soon",
    // TODO: 인스타그램 채널 오픈 후 href
  },
  {
    id: "youtube",
    label: "유튜브",
    shortLabel: "유튜브",
    status: "coming_soon",
    // TODO: 유튜브 채널 오픈 후 href
  },
];

/** @deprecated 공식 채널 UI는 SOCIAL_OFFICIAL_CHANNELS 사용 */
export const OFFICIAL_CHANNELS = SOCIAL_OFFICIAL_CHANNELS;
export const OFFICIAL_CHANNELS_SUBTITLE = SOCIAL_OFFICIAL_CHANNELS_SUBTITLE;

export const STORE_CONTACT_CHANNELS: OfficialChannel[] = [
  {
    id: "naver_place",
    label: "네이버 플레이스",
    shortLabel: "플레이스",
    status: "coming_soon",
  },
  {
    id: "naver_blog",
    label: "네이버 블로그",
    shortLabel: "블로그",
    status: "coming_soon",
  },
  {
    id: "daangn",
    label: "당근",
    shortLabel: "당근",
    status: "coming_soon",
  },
];

export const SMARTSTORE_CHANNEL: OfficialChannel = {
  id: "naver_smartstore",
  label: "스마트스토어",
  shortLabel: "쇼핑몰",
  status: "coming_soon",
  // TODO: 네이버 스마트스토어 URL 확정 후 href
};

export const STORE_CARD_CHANNEL_IDS: OfficialChannelId[] = ["naver_place", "naver_blog"];

export function getOfficialChannel(id: OfficialChannelId): OfficialChannel {
  const all = [...SOCIAL_OFFICIAL_CHANNELS, ...STORE_CONTACT_CHANNELS, SMARTSTORE_CHANNEL];
  const ch = all.find((c) => c.id === id);
  if (!ch) throw new Error(`Unknown channel: ${id}`);
  return ch;
}

export function channelsForStoreCard(): OfficialChannel[] {
  return STORE_CARD_CHANNEL_IDS.map(getOfficialChannel);
}
