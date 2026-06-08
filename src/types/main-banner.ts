export type MainBannerStatus = "active" | "inactive" | "scheduled" | "expired";

export type MainBannerRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string;
  buttonText: string | null;
  promoLabel: string | null;
  imageAlt: string | null;
  status: MainBannerStatus;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  showOnMain: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicMainBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  linkUrl: string;
  buttonText: string | null;
  promoLabel: string | null;
  imageAlt: string | null;
};

export type MainBannerUpsertInput = Partial<Omit<MainBannerRecord, "id" | "createdAt" | "updatedAt">>;

export type MainBannerCreateInput = MainBannerUpsertInput &
  Pick<MainBannerRecord, "title" | "linkUrl">;
