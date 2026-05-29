/**
 * 배터리매니저 공식 운영 채널 — 실제 URL이 확인된 경우에만 href 설정.
 * TODO: 네이버 플레이스·블로그·스마트스토어·당근 URL 확정 시 href 추가.
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
  /** 메인 pill 등 짧은 라벨 */
  shortLabel: string;
  href?: string;
  status: OfficialChannelStatus;
};

export const OFFICIAL_CHANNELS_TITLE = "공식 운영 채널";

export const OFFICIAL_CHANNELS_SUBTITLE =
  "네이버 플레이스·블로그·쇼핑몰·당근에서 함께 운영 중입니다.";

export const OFFICIAL_CHANNELS: OfficialChannel[] = [
  {
    id: "naver_place",
    label: "네이버 플레이스",
    shortLabel: "플레이스",
    status: "coming_soon",
    // TODO: 덕천점·학장점 플레이스 URL 확정 후 href
  },
  {
    id: "naver_blog",
    label: "네이버 블로그",
    shortLabel: "블로그",
    status: "coming_soon",
    // TODO: 공식 블로그 URL 확정 후 href
  },
  {
    id: "naver_smartstore",
    label: "스마트스토어",
    shortLabel: "쇼핑몰",
    status: "coming_soon",
    // TODO: 네이버 스마트스토어 URL 확정 후 href
  },
  {
    id: "daangn",
    label: "당근",
    shortLabel: "당근",
    status: "coming_soon",
    // TODO: 당근 마켓 URL 확정 후 href
  },
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

/** 지점 카드에 노출할 채널 (2~4개 CTA 이내) */
export const STORE_CARD_CHANNEL_IDS: OfficialChannelId[] = ["naver_place", "naver_blog"];

export function getOfficialChannel(id: OfficialChannelId): OfficialChannel {
  const ch = OFFICIAL_CHANNELS.find((c) => c.id === id);
  if (!ch) throw new Error(`Unknown channel: ${id}`);
  return ch;
}

export function channelsForStoreCard(): OfficialChannel[] {
  return STORE_CARD_CHANNEL_IDS.map(getOfficialChannel);
}
