import { catalogEntryToQuestion } from "./mappers";
import { LEGACY_QNA_CATALOG } from "./catalog-legacy";
import { PRIORITY_QNA_CATALOG } from "./catalog-priority";
import type { QnaCatalogEntry } from "./types";

function dedupeCatalog(entries: QnaCatalogEntry[]) {
  const map = new Map<string, QnaCatalogEntry>();
  for (const e of entries) {
    if (!map.has(e.id)) map.set(e.id, e);
  }
  return [...map.values()];
}

/** platform-catalog catalogExtraQuestions 대체 */
export const platformQnaQuestions = dedupeCatalog([...LEGACY_QNA_CATALOG, ...PRIORITY_QNA_CATALOG]).map(
  catalogEntryToQuestion,
);
