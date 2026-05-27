import type { Page } from "@playwright/test";

export type PageObservation = {
  pageTitle: string;
  pageUrl: string;
  topVisibleTextSample: string;
  fullPageTextSample: string;
  visibleHeadings: string[];
  visibleButtons: string[];
  visibleCardsSummary: string[];
};

const TOP_TEXT_LIMIT = 1200;
const FULL_TEXT_LIMIT = 2000;
const MAX_HEADINGS = 12;
const MAX_BUTTONS = 20;
const MAX_CARDS = 10;

export async function collectPageObservation(page: Page): Promise<PageObservation> {
  const data = await page.evaluate(
    ({ topLimit, fullLimit, maxH, maxB, maxC }) => {
      const bodyText = document.body.innerText ?? "";
      const topText = bodyText.slice(0, topLimit);
      const title = document.title || "";

      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((el) => (el.textContent ?? "").trim())
        .filter((t) => t.length > 0 && t.length < 120)
        .slice(0, maxH);

      const buttons = Array.from(document.querySelectorAll("a, button"))
        .map((el) => (el.textContent ?? "").trim())
        .filter((t) => t.length > 0 && t.length < 80)
        .slice(0, maxB);

      const cardSelectors = "article, [class*='card'], li.rounded-xl, li.rounded-lg, .rounded-2xl.border";
      const cards = Array.from(document.querySelectorAll(cardSelectors))
        .map((el) => {
          const h = el.querySelector("h1, h2, h3, h4, [class*='title']");
          const t = (h?.textContent ?? el.textContent ?? "").trim().replace(/\s+/g, " ");
          return t.slice(0, 100);
        })
        .filter(Boolean)
        .slice(0, maxC);

      return {
        pageTitle: title,
        topVisibleTextSample: topText,
        fullPageTextSample: bodyText.slice(0, fullLimit),
        visibleHeadings: headings,
        visibleButtons: [...new Set(buttons)],
        visibleCardsSummary: cards,
      };
    },
    {
      topLimit: TOP_TEXT_LIMIT,
      fullLimit: FULL_TEXT_LIMIT,
      maxH: MAX_HEADINGS,
      maxB: MAX_BUTTONS,
      maxC: MAX_CARDS,
    },
  );

  return {
    pageUrl: page.url(),
    ...data,
  };
}
