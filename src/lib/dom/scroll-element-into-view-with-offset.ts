/** sticky 헤더·탭 높이를 반영한 페이지 스크롤 (매장 카드 포커스 등) */

function measureStickyTopOffset(): number {
  if (typeof document === "undefined") return 96;

  let offset = 72;

  const banner = document.querySelector<HTMLElement>(".first-order-member-banner--site-top");
  if (banner) {
    const rect = banner.getBoundingClientRect();
    if (rect.bottom > 0) offset = Math.max(offset, rect.bottom);
  }

  const header = document.querySelector<HTMLElement>(".portal-site-header");
  if (header) {
    const rect = header.getBoundingClientRect();
    if (rect.bottom > 0) offset = Math.max(offset, rect.bottom);
  }

  if (window.matchMedia("(max-width: 1023px)").matches) {
    const mobileNav = document.querySelector<HTMLElement>(".portal-header-mobile-nav-wrap");
    if (mobileNav) {
      const rect = mobileNav.getBoundingClientRect();
      if (rect.bottom > 0) offset = Math.max(offset, rect.bottom);
    }
  }

  return offset + 10;
}

function isElementSufficientlyVisible(element: HTMLElement, topOffset: number): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const visibleTop = topOffset + 8;
  const visibleBottom = viewportHeight - 24;
  const topOk = rect.top >= visibleTop;
  const bottomOk = rect.bottom <= visibleBottom;
  const heightFits = rect.height <= visibleBottom - visibleTop;
  return topOk && (bottomOk || heightFits);
}

export function scrollElementIntoViewWithOffset(
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; force?: boolean },
): void {
  const behavior = options?.behavior ?? "smooth";
  const topOffset = measureStickyTopOffset();

  if (!options?.force && isElementSufficientlyVisible(element, topOffset)) {
    return;
  }

  const rect = element.getBoundingClientRect();
  const targetTop = window.scrollY + rect.top - topOffset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  });
}
