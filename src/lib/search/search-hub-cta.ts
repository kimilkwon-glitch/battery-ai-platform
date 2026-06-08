import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS, HUB_STORE, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";

export type CustomerHubKind = "store" | "shop" | null;

const STORE_QUERY =
  /덕천|학장|출장|내방|직영|매장|교체\s*상담|가능\s*지역|부산.*배터리|배터리\s*교체\s*가능|방문\s*교체/i;
const SHOP_QUERY =
  /택배|쇼핑|주문\s*전|상품\s*확인|배터리\s*상품|반납|회수|배송|온라인\s*주문|AGM\w+\s*주문/i;

export function detectCustomerHubFromQuery(query: string): CustomerHubKind {
  const store = STORE_QUERY.test(query);
  const shop = SHOP_QUERY.test(query);
  if (store && !shop) return "store";
  if (shop && !store) return "shop";
  if (shop) return "shop";
  if (store) return "store";
  return null;
}

export function hubCtaForQuery(query: string): { label: string; href: string } | null {
  const hub = detectCustomerHubFromQuery(query);
  if (hub === "store") {
    if (/덕천/.test(query)) return { label: "덕천점 안내", href: HUB_STORE_ANCHORS.deokcheon };
    if (/학장/.test(query)) return { label: "학장점 안내", href: HUB_STORE_ANCHORS.hakjang };
    if (/출장|가능\s*지역|부산/.test(query)) {
      return { label: "출장 가능 지역 보기", href: HUB_STORE_ANCHORS.regions };
    }
    if (/내방/.test(query)) return { label: "내방 교체 안내", href: HUB_STORE_ANCHORS.visit };
    return { label: "매장·출장 안내", href: HUB_STORE };
  }
  if (hub === "shop") {
    if (/택배|배송|반납|회수/.test(query)) {
      return { label: "택배 주문 전 확인", href: HUB_SHOP_ANCHORS.delivery };
    }
    if (/상품/.test(query)) return { label: "배터리 상품 확인", href: HUB_SHOP_ANCHORS.products };
    if (/주문\s*전|규격\s*확인/.test(query)) {
      return { label: "주문 전 규격 확인", href: HUB_SHOP_ANCHORS.orderCheck };
    }
    return { label: "배터리 검색", href: HUB_SHOP };
  }
  return null;
}

export function prependHubCtas(
  ctas: { label: string; href: string }[],
  query: string,
  flags: { order?: boolean; inquiry?: boolean; terminalDirection?: boolean },
): { label: string; href: string }[] {
  const hub = hubCtaForQuery(query);
  const out: { label: string; href: string }[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    out.push({ label, href });
  };

  if (hub) add(hub.label, hub.href);

  if (flags.order && !hub) {
    add("배터리 검색", HUB_SHOP);
    add("주문 전 규격 확인", HUB_SHOP_ANCHORS.orderCheck);
  }

  if (flags.terminalDirection) {
    add("단자 방향 확인", HUB_SHOP_ANCHORS.terminal);
    add("사진으로 규격 확인", HUB_PHOTO);
  }

  for (const c of ctas) add(c.label, c.href);
  return out;
}
