import {
  areNeverSuggestTogether,
  filterConfusionForDisplay,
} from "@/data/battery/batterySpecRelations";
import type { BatteryDetailHubContent, HubBadge, HubCompareCard, HubFeaturedVehicle } from "@/lib/battery-detail/battery-detail-hub-content";
import { isBatteryMatched } from "@/lib/batteryNormalize";
import { OPERATOR_SLUG_PRIMARY_BATTERY } from "@/lib/vehicle-fuel-primary-battery";

function sanitizeCompareCards(code: string, cards: HubCompareCard[]): HubCompareCard[] {
  return cards.filter((c) => !areNeverSuggestTogether(code, c.target));
}

function sanitizeBadges(badges: HubBadge[]): HubBadge[] {
  return badges.filter((b) => !/100R.*대체|단순 대체.*100R|대체\s*금지/i.test(b.text));
}

function sanitizeCautionNotes(notes: string[]): string[] {
  return notes.filter((n) => !/100R/i.test(n) && !/AGM95L.*100R|100R.*AGM95L/i.test(n));
}

/** operator 확정 규격과 맞지 않는 대표 적용 차량 제거 */
function sanitizeFeaturedVehicles(code: string, vehicles: HubFeaturedVehicle[]): HubFeaturedVehicle[] {
  return vehicles.filter((v) => {
    const operatorPrimary = OPERATOR_SLUG_PRIMARY_BATTERY[v.slug];
    if (!operatorPrimary) return true;
    return isBatteryMatched(operatorPrimary, code);
  });
}

/** 고객 상세 화면 — neverSuggest·cautionOnly·중복 오주문 박스 정리 */
export function sanitizeBatteryDetailHubContent(
  content: BatteryDetailHubContent,
): BatteryDetailHubContent {
  return {
    ...content,
    compareCards: sanitizeCompareCards(content.code, content.compareCards),
    confusionSpecs: filterConfusionForDisplay(content.code, content.confusionSpecs),
    badges: sanitizeBadges(content.badges),
    featuredVehicles: sanitizeFeaturedVehicles(content.code, content.featuredVehicles),
    misorderTips: [],
    cautionNotes: sanitizeCautionNotes(content.cautionNotes),
  };
}
