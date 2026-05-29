/**
 * 외부 링크 단일 소스 — 공식 SNS / 지점 / 쇼핑 분리
 */

export type LinkStatus = "active" | "coming-soon";

export type SocialChannelKey = "instagram" | "youtube";

export const officialChannels: Record<
  SocialChannelKey,
  { label: string; href: string | null; status: LinkStatus }
> = {
  instagram: {
    label: "인스타그램",
    href: null,
    status: "coming-soon",
  },
  youtube: {
    label: "유튜브",
    href: null,
    status: "coming-soon",
  },
};

export type StoreLinkKey = "deokcheon" | "hakjang";

export const storeLinks: Record<
  StoreLinkKey,
  {
    name: string;
    phone: string;
    tel: string;
    naverPlace: string;
    blog: string;
    daangn: string;
  }
> = {
  deokcheon: {
    name: "덕천점",
    phone: "010-8339-8316",
    tel: "tel:010-8339-8316",
    naverPlace: "https://map.naver.com/p/entry/place/2028214247",
    blog: "https://blog.naver.com/batterymanager",
    daangn:
      "https://www.daangn.com/kr/local-profile/%EB%B6%80%EC%82%B0%EB%B0%B0%ED%84%B0%EB%A6%AC%EB%A7%A4%EB%8B%88%EC%A0%80-%EB%8D%95%EC%B2%9C%EC%A0%90-qc1bj7979wx7/",
  },
  hakjang: {
    name: "학장점",
    phone: "010-8896-8316",
    tel: "tel:010-8896-8316",
    naverPlace: "https://map.naver.com/p/entry/place/2094827192",
    blog: "https://blog.naver.com/batterymanager_",
    daangn:
      "https://www.daangn.com/kr/local-profile/%EB%B6%80%EC%82%B0-%EB%B0%B0%ED%84%B0%EB%A6%AC-%EB%A7%A4%EB%8B%88%EC%A0%80-%ED%95%99%EC%9E%A5%EC%A0%90-g26zobkcw314/",
  },
};

export const shoppingLinks = {
  batteryManager: {
    label: "밧데리매니저",
    href: "https://smartstore.naver.com/batterymanager",
  },
  batteryPlace: {
    label: "피에이스토어",
    href: "https://smartstore.naver.com/batteryplace",
  },
} as const;
