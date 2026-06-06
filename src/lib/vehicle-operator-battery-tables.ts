// Battery Manager 차량-배터리 전체 매칭 v2 (total mapping proposal 기준 replace)
// Generated from battery_manager_vehicle_battery_total_mapping_proposal + 운영 확정 규칙.
// 고객-facing SoT — HOLD/sales_excluded slug는 추천 카드에 노출하지 않음.

export {
  BATTERY_SPEC_NORMALIZATION,
  batterySpecNormalizationReason,
  normalizeBatterySpecCode,
} from "@/lib/battery-spec-normalization";

export const BM_TOTAL_OPERATOR_SLUG_PRIMARY_BATTERY = {
  "daewoo-tosca-2006": "80R",
  "gmdaewoo-damas-2011": "50L",
  "gmdaewoo-labo-2011": "50L",
  "grandeur-hg": "80L",
  "grandeur-tg": "80L",
  "santafe-tm": "AGM95L",
  "kg-the-new-tivoli-2023": "AGM70L",
  "bongo3-truck": "100L",
  "carnival-ka4-fl": "AGM95L",
  "carnival-vq": "100L",
  "carnival-yp": "90L",
  "carnival-yp-fl": "90L",
  "k3-bd": "DIN62L",
  "k3-bd-fl": "DIN62L",
  "k3-yd": "DIN62L",
  "k5-jf": "AGM80L",
  "k5-tf": "80L",
  "k8-gl3": "AGM70L",
  "k8-gl3-fl": "AGM70L",
  "kia-all-new-carens-2013": "80L",
  "kia-mohave-2008": "100L",
  "kia-soul-2008": "60AL",
  "morning-ja": "40AL",
  "morning-ja-fl": "40AL",
  "morning-sa": "40AL",
  "morning-ta": "40AL",
  "niro-de": "DIN50L",
  "niro-de-fl": "DIN50L",
  "ray-tam": "60AL",
  "ray-tam-2fl": "60AL",
  "sorento-um": "AGM95L",
  "sorento-um-fl": "AGM95L",
  "sorento-xm": "90L",
  "sportage-nq5": "AGM70L",
  "sportage-nq5-fl": "AGM70L",
  "sportage-ql": "AGM80L",
  "sportage-sl": "90R",
  "renault-samsung-all-new-sm7-2011": "DIN90L",
  "renault-samsung-new-sm3-2009": "DIN74L",
  "renault-samsung-new-sm5-2010": "DIN90L",
  "renault-samsung-qm3-2013": "AGM70L",
  "renault-samsung-qm5-2007": "80L",
  "renault-samsung-qm6-2016": "DIN74L",
  "renault-samsung-sm3-2005": "80L",
  "renault-samsung-sm3-neo-2014": "DIN74L",
  "renault-samsung-sm5-new-impression-2007": "80L",
  "renault-samsung-sm5-nova-2015": "DIN90L",
  "renault-samsung-sm6-2016": "DIN74L",
  "renault-samsung-sm7-new-art-2008": "80L",
  "renault-samsung-sm7-nova-2014": "DIN90L",
  "renault-samsung-the-new-qm6-2019": "DIN74L",
  "renault-samsung-the-new-sm6-2020": "DIN74L",
  "renault-samsung-xm3-2020": "AGM60L",
  "chevrolet-all-new-cruze-2017": "AGM80L",
  "chevrolet-aveo-2011": "DIN62L",
  "chevrolet-captiva-2011": "DIN100L",
  "chevrolet-captiva-2016": "DIN100L",
  "chevrolet-colorado-2019": "AGM70L",
  "chevrolet-colorado-2021": "AGM70L",
  "chevrolet-cruze-2011": "DIN74L",
  "chevrolet-equinox-2018": "AGM70L",
  "chevrolet-impala-2016": "AGM80L",
  "chevrolet-malibu-2011": "DIN74L",
  "chevrolet-malibu-2016": "DIN74L",
  "chevrolet-malibu-2019": "AGM70L",
  "chevrolet-orlando-2011": "DIN90L",
  "chevrolet-spark-2011": "DIN44L",
  "chevrolet-spark-2015": "DIN50L",
  "chevrolet-spark-2018": "DIN50L",
  "chevrolet-spark-2021": "DIN50L",
  "chevrolet-spark-s-2013": "DIN44L",
  "chevrolet-trailblazer-2020": "AGM70L",
  "chevrolet-traverse-2019": "AGM95L",
  "chevrolet-trax-2013": "DIN62L",
  "chevrolet-trax-2017": "DIN62L",
  "chevrolet-trax-crossover-2023": "DIN62L",
  "daewoo-lacetti-premiere-2008": "DIN74L",
  "gmdaewoo-alpheon-2010": "DIN74L",
  "gmdaewoo-gentra-x-2007": "60R",
  "gmdaewoo-lacetti-2006": "60R",
  "gmdaewoo-matiz-creative-2009": "DIN44L",
  "gmdaewoo-winstorm-2006": "DIN100L",
  "ssangyong-actyon-2005": "90R",
  "ssangyong-actyon-sports-2006": "90R",
  "ssangyong-all-new-rexton-2020": "90R",
  "ssangyong-chairman-w-2008": "DIN100L",
  "ssangyong-g4-rexton-2017": "90R",
  "ssangyong-korando-c-2011": "90R",
  "ssangyong-korando-sports-2012": "90R",
  "ssangyong-korando-turismo-2013": "90R",
  "ssangyong-kyron-2005": "90R",
  "ssangyong-musso-sports-2002": "90R",
  "ssangyong-new-chairman-2005": "DIN100L",
  "ssangyong-new-korando-c-2013": "90R",
  "ssangyong-new-style-korando-c-2017": "90R",
  "ssangyong-rexton-2001": "90R",
  "ssangyong-rexton-sports-2018": "90R",
  "ssangyong-rexton-sports-khan-2019": "90R",
  "ssangyong-tivoli-2015": "80L",
  "ssangyong-tivoli-air-2016": "80L",
  "ssangyong-tivoli-air-2021": "AGM70L",
  "ssangyong-tivoli-armour-2017": "80L",
  "ssangyong-very-new-tivoli-2019": "AGM70L",
  "ssangyong-viewtiful-korando-2019": "90R",
  "genesis-g90": "AGM105L",
  "avante-ad": "DIN62L",
  "avante-hd": "60AL",
  "avante-md": "DIN62L",
  "hyundai-grand-starex-2007": "90R",
  "kona-os": "AGM60L",
  "porter2-old": "90R",
  "santafe-cm": "90L",
  "santafe-dm": "AGM95L",
  "sonata-lf": "80L",
  "sonata-nf": "80L",
  "sonata-yf": "80L",
  "tucson-jm": "90R",
  "tucson-lm": "90R",
  "tucson-tl": "AGM80L",
  "kg-actyon-2024": "AGM70L",
  "kg-torres-2022": "AGM70L",
  "kg-torres-evx-2023": "60R",
  "bongo3-ev": "80L",
  "carnival-ka4": "AGM95L",
  "k5-dl3": "DIN74L",
  "k5-dl3-fl": "DIN74L",
  "kia-carens-2006": "60AL",
  "kia-k9-2012": "DIN100L",
  "kia-mohave-the-master-2019": "100L",
  "kia-soul-booster-2019": "AGM60L",
  "kia-the-k9-2018": "AGM105L",
  "kia-the-new-mohave-2016": "100L",
  "seltos-sp2": "AGM60L",
  "seltos-sp2-fl": "AGM60L",
  "sorento-mq4": "AGM95L",
  "sorento-mq4-fl": "AGM95L",
  "renault-arkana-2024": "AGM60L",
  "renault-master-2018": "AGM95L",
  "renault-samsung-qm6-quest-2023": "DIN74L",
  "chevrolet-bolt-ev-2017": "AGM50L",
  "chevrolet-equinox-2022": "AGM70L",
  "chevrolet-the-new-cruze-2015": "DIN60L",
  "chevrolet-trailblazer-2024": "AGM70L",
  "genesis-dh": "AGM105L",
  "genesis-eq900": "AGM105L",
  "genesis-g70": "AGM80L",
  "genesis-g80-dh": "AGM105L",
  "genesis-g80-rg3": "AGM95R",
  "genesis-gv60": "AGM60L",
  "genesis-gv70": "AGM80R",
  "genesis-gv80": "AGM95R",
  "avante-cn7": "AGM60L",
  "avante-cn7-fl": "AGM60L",
  "grandeur-gn7": "AGM80L",
  "grandeur-ig": "AGM80L",
  "grandeur-ig-fl": "AGM80L",
  "ioniq5-ne": "ev_low_voltage_battery",
  "ioniq6-ce": "ev_low_voltage_battery",
  "renault-samsung-sm3-ze-2013": "ev_low_voltage_battery",
  "ssangyong-korando-emotion-2022": "ev_low_voltage_battery",
  "kona-sx2": "AGM60L",
  "palisade-lx2": "AGM95L",
  "palisade-lx2-fl": "AGM95L",
  "palisade-lx3": "AGM95L",
  "porter2-ev": "80L",
  "porter2-new": "100R",
  "santafe-mx5": "AGM70L",
  "santafe-mx5-hev": "AGM60L",
  "sonata-dn8": "AGM80L",
  "sonata-edge": "AGM80L",
  "staria-us4": "AGM80R",
  "tucson-nx4": "AGM70L",
  "tucson-nx4-fl": "AGM70L"
} as const;

export const BM_TOTAL_OPERATOR_FUEL_PRIMARY = {
  "grandeur-hg": {
    "가솔린": "80L",
    "LPG": "80L",
    "디젤": "90L",
    "하이브리드": "DIN74L"
  },
  "carnival-vq": {
    "디젤": "100L",
    "LPG": "80L"
  },
  "k3-yd": {
    "가솔린": "DIN62L",
    "디젤": "DIN62L",
    "ISG": "AGM70L"
  },
  "k5-jf": {
    "일반": "80L",
    "ISG": "AGM80L",
    "하이브리드": "DIN74L"
  },
  "k8-gl3": {
    "2.5 가솔린": "AGM70L",
    "3.5 가솔린": "AGM80L",
    "LPG": "DIN90L",
    "하이브리드": "AGM70L"
  },
  "k8-gl3-fl": {
    "2.5 가솔린": "AGM70L",
    "3.5 가솔린": "AGM80L",
    "LPG": "DIN90L",
    "하이브리드": "AGM70L"
  },
  "kia-soul-2008": {
    "가솔린": "60AL",
    "디젤": "80L"
  },
  "morning-ja": {
    "일반": "40AL",
    "모닝 어반/터보": "DIN50L"
  },
  "morning-ja-fl": {
    "일반": "40AL",
    "터보/상위": "DIN50L"
  },
  "sportage-nq5": {
    "가솔린": "AGM70L",
    "디젤": "AGM70L",
    "LPG": "AGM80L",
    "하이브리드": "AGM60L"
  },
  "sportage-nq5-fl": {
    "가솔린": "AGM70L",
    "디젤": "AGM70L",
    "LPG": "AGM80L",
    "하이브리드": "AGM60L"
  },
  "sportage-ql": {
    "가솔린": "AGM70L",
    "디젤": "AGM80L",
    "LPG": "DIN74L"
  },
  "sportage-sl": {
    "가솔린": "80L",
    "디젤": "90R"
  },
  "renault-samsung-all-new-sm7-2011": {
    "2.5/LPG": "DIN90L",
    "3.5": "DIN100L"
  },
  "renault-samsung-qm6-2016": {
    "가솔린/LPe": "DIN74L",
    "디젤/ISG": "AGM70L"
  },
  "renault-samsung-sm3-neo-2014": {
    "가솔린": "DIN74L",
    "디젤": "AGM70L"
  },
  "renault-samsung-sm7-new-art-2008": {
    "2.3/일반": "80L",
    "3.5/대용량": "DIN100L"
  },
  "renault-samsung-sm7-nova-2014": {
    "2.0 LPG/2.5": "DIN90L",
    "3.5": "DIN100L"
  },
  "chevrolet-all-new-cruze-2017": {
    "가솔린": "80L",
    "디젤/ISG": "AGM80L"
  },
  "chevrolet-malibu-2019": {
    "일반": "DIN74L",
    "스마트충전": "AGM70L"
  },
  "chevrolet-trax-2013": {
    "가솔린": "DIN62L",
    "디젤": "DIN74L"
  },
  "chevrolet-trax-2017": {
    "가솔린": "DIN62L",
    "디젤": "DIN74L"
  },
  "ssangyong-viewtiful-korando-2019": {
    "디젤": "90R",
    "가솔린": "AGM70L"
  },
  "genesis-g90": {
    "2018-2021": "AGM105L",
    "2022+": "AGM105R"
  },
  "avante-ad": {
    "가솔린": "DIN62L",
    "LPG": "DIN62L",
    "디젤": "DIN62L",
    "ISG": "AGM70L"
  },
  "avante-hd": {
    "가솔린": "60AL",
    "LPG": "60AL",
    "디젤": "80L",
    "하이브리드": "60L"
  },
  "avante-md": {
    "가솔린": "DIN62L",
    "LPG": "DIN62L",
    "디젤": "DIN62L",
    "디젤 ISG": "AGM70L"
  },
  "hyundai-grand-starex-2007": {
    "디젤": "90R",
    "LPG": "80R"
  },
  "kona-os": {
    "가솔린": "AGM60L",
    "디젤": "AGM60L",
    "전기": "AGM60L",
    "하이브리드": "판매제외"
  },
  "santafe-cm": {
    "가솔린": "80L",
    "디젤": "90L"
  },
  "santafe-dm": {
    "가솔린": "AGM95L",
    "디젤": "AGM95L",
    "일반/초기": "90L"
  },
  "sonata-lf": {
    "가솔린": "80L",
    "LPG": "80L",
    "터보/ISG": "AGM70L",
    "하이브리드": "DIN74L"
  },
  "sonata-nf": {
    "가솔린": "80L",
    "LPG": "80L",
    "디젤": "90L"
  },
  "sonata-yf": {
    "가솔린": "80L",
    "LPG": "80L",
    "하이브리드": "DIN74L"
  },
  "tucson-jm": {
    "가솔린": "80L",
    "디젤": "90R"
  },
  "tucson-lm": {
    "가솔린": "80L",
    "디젤": "90R"
  },
  "tucson-tl": {
    "가솔린": "AGM70L",
    "디젤": "AGM80L",
    "ISG": "AGM80L",
    "LPG": "DIN74L"
  },
  "sorento-mq4": {
    "가솔린": "AGM95L",
    "디젤": "AGM95L",
    "하이브리드": "AGM60L"
  },
  "sorento-mq4-fl": {
    "가솔린": "AGM95L",
    "디젤": "AGM95L",
    "하이브리드": "AGM60L"
  },
  "chevrolet-the-new-cruze-2015": {
    "가솔린": "DIN60L",
    "디젤": "DIN74L",
    "ISG/스마트충전": "AGM80L"
  },
  "kona-sx2": {
    "가솔린": "AGM60L",
    "전기": "ev_low_voltage_battery",
    "하이브리드": "판매제외"
  },
  "santafe-mx5": {
    "가솔린": "AGM70L"
  }
} as const;

export const BM_TOTAL_SALES_EXCLUDED_SLUGS = [
  "niro-sg2"
] as const;

/** @deprecated hold → ev_low_voltage 재분류. 고객 화면 hold 미노출 */
export const BM_TOTAL_HOLD_INTERNAL_SLUGS = [] as const;

/** EV 저전압 배터리 매칭 대상 (전체 차량) */
export const BM_TOTAL_EV_LOW_VOLTAGE_SLUGS = [
  "ioniq5-ne",
  "ioniq6-ce",
  "renault-samsung-sm3-ze-2013",
  "ssangyong-korando-emotion-2022",
] as const;

export const BM_TOTAL_CORRECTION_NOTES = [
  {
    "slug": "daewoo-tosca-2006",
    "currentResolvedBattery": "AGM80R",
    "proposedPrimaryBattery": "80R",
    "note": "사용자 확정."
  },
  {
    "slug": "gmdaewoo-damas-2011",
    "currentResolvedBattery": "DIN50L",
    "proposedPrimaryBattery": "50L",
    "note": "사용자 확정."
  },
  {
    "slug": "gmdaewoo-labo-2011",
    "currentResolvedBattery": "DIN50L",
    "proposedPrimaryBattery": "50L",
    "note": "사용자 확정."
  },
  {
    "slug": "grandeur-hg",
    "currentResolvedBattery": "DIN74L",
    "proposedPrimaryBattery": "80L",
    "note": "기존 DIN74L보다 raw DB/상품 운영상 80L 우선. 디젤/HEV는 내부 연료맵 보조."
  },
  {
    "slug": "grandeur-tg",
    "currentResolvedBattery": "DIN74L",
    "proposedPrimaryBattery": "80L",
    "note": "기존 DIN74L보다 raw DB/상품 운영상 80L 우선. TG 가솔린/LPG 대표."
  },
  {
    "slug": "santafe-tm",
    "currentResolvedBattery": "AGM80L",
    "proposedPrimaryBattery": "AGM95L",
    "note": "사용자 운영 확정: TM은 95 계열 주문 많음. 기존 AGM80L 교정 필요."
  }
] as const;

/** 런타임·고객 UI — v2 운영 확정 테이블 (BM_TOTAL replace, legacy fallback 없음) */
export const OPERATOR_SLUG_PRIMARY_BATTERY: Record<string, string> = {
  ...BM_TOTAL_OPERATOR_SLUG_PRIMARY_BATTERY,
};

export const OPERATOR_FUEL_PRIMARY: Record<string, Record<string, string>> = {
  ...BM_TOTAL_OPERATOR_FUEL_PRIMARY,
};

export const OPERATOR_HOLD_INTERNAL_SLUGS: ReadonlySet<string> = new Set(
  BM_TOTAL_HOLD_INTERNAL_SLUGS,
);

export const OPERATOR_EV_LOW_VOLTAGE_SLUGS: ReadonlySet<string> = new Set(
  BM_TOTAL_EV_LOW_VOLTAGE_SLUGS,
);

export const OPERATOR_SALES_EXCLUDED_SLUGS: ReadonlySet<string> = new Set(
  BM_TOTAL_SALES_EXCLUDED_SLUGS,
);
