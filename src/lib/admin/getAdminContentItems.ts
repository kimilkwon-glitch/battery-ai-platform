import contentWorkbenchJson from "@/data/admin/contentWorkbench.json";
import adminRealJson from "@/data/admin/adminContent.real.json";
import type { AdminContentItem } from "@/data/admin/adminContent.schema";
import { defaultAdminContentItem } from "@/data/admin/adminContent.schema";
import { collectAllAdminContentItems } from "./collectAllContent";

function ensureItem(raw: Partial<AdminContentItem>): AdminContentItem {
  return defaultAdminContentItem(raw);
}

export type AdminContentLoadResult = {
  items: AdminContentItem[];
  source: "workbench" | "real" | "integrated" | "empty";
};

/**
 * 관리자 UI / 워크벤치 로드 우선순위:
 * 1. contentWorkbench.json
 * 2. adminContent.real.json
 * 3. collectAllAdminContentItems() 통합 수집
 */
export function getAdminContentItems(): AdminContentLoadResult {
  const workbench = (contentWorkbenchJson as AdminContentItem[]).filter((x) => x?.id);
  if (workbench.length > 0) {
    return { items: workbench.map((x) => ensureItem(x)), source: "workbench" };
  }

  const real = (adminRealJson as AdminContentItem[]).filter((x) => x?.id);
  if (real.length > 0) {
    return { items: real.map((x) => ensureItem(x)), source: "real" };
  }

  const integrated = collectAllAdminContentItems();
  if (integrated.length > 0) {
    return { items: integrated, source: "integrated" };
  }

  return { items: [], source: "empty" };
}

export {
  collectAllAdminContentItems,
  CONTENT_SOURCE_FILES,
  filterAdminContentItems,
  getAdminCategories,
  getAdminContentStats,
  isConnectionMissing,
  thumbnailTypeForContentType,
} from "./collectAllContent";
