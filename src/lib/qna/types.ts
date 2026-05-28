import type { Question, QuestionCtaType, QuestionType } from "@/lib/platform-types";

/** Q&A 카탈로그 원본 — platform Question으로 변환 */
export type QnaCatalogEntry = {
  id: string;
  question: string;
  shortAnswer: string;
  answer: string;
  category: string;
  tags: string[];
  questionType?: QuestionType;
  relatedBatteryCodes?: string[];
  relatedVehicleSlugs?: string[];
  relatedSearchQueries?: string[];
  relatedGuideId?: string;
  vehicleId?: string;
  batteryCode?: string;
  ctaType?: QuestionCtaType;
  priority?: number;
  featured?: boolean;
  homeFeatured?: boolean;
  activityLabel?: string;
  updatedAt?: string;
};

export type QnaMatchContext = {
  batteryCode?: string;
  vehicleSlug?: string;
  searchQuery?: string;
  compareCodes?: string[];
  limit?: number;
};

export type { Question };
