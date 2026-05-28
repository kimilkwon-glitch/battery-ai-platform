import type { Question } from "@/lib/platform-types";
import type { QnaCatalogEntry } from "./types";

export function catalogEntryToQuestion(entry: QnaCatalogEntry): Question {
  return {
    id: entry.id,
    title: entry.question,
    shortAnswer: entry.shortAnswer,
    answer: entry.answer,
    status: "답변완료",
    category: entry.category,
    tags: entry.tags,
    vehicleId: entry.vehicleId ?? entry.relatedVehicleSlugs?.[0],
    batteryCode: entry.batteryCode ?? entry.relatedBatteryCodes?.[0],
    guideId: entry.relatedGuideId,
    questionType: entry.questionType,
    featured: entry.featured,
    homeFeatured: entry.homeFeatured,
    activityLabel: entry.activityLabel,
    updatedAt: entry.updatedAt ?? "2026-05-28",
    relatedBatteryCodes: entry.relatedBatteryCodes,
    relatedVehicleSlugs: entry.relatedVehicleSlugs,
    relatedSearchQueries: entry.relatedSearchQueries,
    priority: entry.priority ?? 0,
    ctaType: entry.ctaType,
  };
}
