/** 규격·차량·검색별 Q&A fallback ID — 리졸버 점수 미달 시에도 핵심 연결 보장 */

export const BATTERY_QNA_FALLBACK: Record<string, string[]> = {
  AGM60L: [
    "q-sportage-nq5-agm60l",
    "q-agm60l-vs-ev12v",
    "q-hybrid-replace",
    "q-k8-hybrid-photo",
  ],
  "EV 12V": ["q-agm60l-vs-ev12v", "q-ev-hv-vs-aux", "q-ev6-12v", "q-ev6-vs-agm60"],
  "100R": [
    "q-porter2-year",
    "q-90r-100r-interchange",
    "q-100r-l-or-r",
    "q-porter2-2020-100r",
  ],
  "90R": ["q-porter2-year", "q-90r-100r-interchange", "q-porter2-year-importance", "q-100r-l-or-r"],
  CMF80L: [
    "q-cmf80l-vs-agm80l",
    "q-cmf80l-search-80l",
    "q-staria-diesel-cmf80l",
    "q-cmf80l-terminal",
  ],
  AGM70L: ["q-agm70l-vs-agm80l", "q-grandeur-ig-fuel-diff", "q-isg-agm-required"],
  AGM80L: ["q-agm70l-vs-agm80l", "q-agm-vs-regular", "q-din-to-agm", "q-grandeur-ig-fuel-diff"],
  DIN74L: ["q-bongo3-din74l", "q-din74l-vs-din62l", "q-din-vs-80l", "q-din74l-57412-family"],
  AGM95L: ["q-100r-vs-agm95l", "q-agm95l-vehicle-group", "q-sorento-agm"],
};

export const VEHICLE_QNA_FALLBACK: Record<string, string[]> = {
  "sportage-nq5": [
    "q-sportage-nq5-agm60l",
    "q-hybrid-replace",
    "q-agm60l-vs-ev12v",
    "q-k8-hybrid-photo",
  ],
  "k8-gl3": ["q-k8-hybrid-photo", "q-hybrid-replace", "q-agm60l-vs-ev12v", "q-sportage-nq5-agm60l"],
  "porter2-new": ["q-porter2-year", "q-porter2-2020-100r", "q-100r-l-or-r", "q-90r-100r-interchange"],
  "porter2-old": ["q-porter2-year", "q-porter2-year-importance", "q-90r-100r-interchange"],
  "staria-us4": ["q-staria-diesel-cmf80l", "q-cmf80l-vs-agm80l", "q-staria-80r"],
  "bongo3-truck": ["q-bongo3-din74l", "q-din74l-57412-family", "q-din74l-vs-din62l"],
  ev6: ["q-ev6-vs-agm60", "q-ev-hv-vs-aux", "q-agm60l-vs-ev12v"],
  ioniq5: ["q-ev-hv-vs-aux", "q-agm60l-vs-ev12v", "q-ev6-12v"],
};

/** 검색어 패턴(정규) → fallback IDs */
export const SEARCH_QNA_FALLBACK: { pattern: RegExp; ids: string[] }[] = [
  {
    pattern: /블랙박스|방전|암전류|레이/i,
    ids: ["q-blackbox", "q-parasitic-current", "q-long-park-discharge-replace", "q-slow-crank-battery"],
  },
  {
    pattern: /포터|90r|100r/i,
    ids: ["q-porter2-year", "q-90r-100r-interchange", "q-100r-l-or-r", "q-porter2-2020-100r"],
  },
  {
    pattern: /100r.*agm95|agm95.*100r|vs/i,
    ids: ["q-100r-vs-agm95l", "q-100r-l-or-r", "q-agm95l-vehicle-group", "q-compare-substitute"],
  },
  {
    pattern: /스포티지|nq5|하이브리드/i,
    ids: ["q-sportage-nq5-agm60l", "q-hybrid-replace", "q-agm60l-vs-ev12v", "q-k8-hybrid-photo"],
  },
  {
    pattern: /k8|하이브리드/i,
    ids: ["q-k8-hybrid-photo", "q-hybrid-replace", "q-agm60l-vs-ev12v", "q-sportage-nq5-agm60l"],
  },
  {
    pattern: /cmf80|스타리아/i,
    ids: ["q-cmf80l-search-80l", "q-staria-diesel-cmf80l", "q-cmf80l-vs-agm80l", "q-cmf80l-terminal"],
  },
  {
    pattern: /봉고|din74/i,
    ids: ["q-bongo3-din74l", "q-din74l-57412-family", "q-din-vs-80l"],
  },
  {
    pattern: /ev6|아이오닉|보조배터리|ev\s*12/i,
    ids: ["q-ev6-vs-agm60", "q-ev-hv-vs-aux", "q-agm60l-vs-ev12v", "q-ev6-12v"],
  },
];
