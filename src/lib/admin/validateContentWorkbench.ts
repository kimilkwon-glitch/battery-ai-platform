import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentThumbnailType,
  AdminContentType,
} from "@/data/admin/adminContent.schema";
import {
  ADMIN_CONTENT_STATUS_LABELS,
  ADMIN_CONTENT_TYPE_LABELS,
} from "@/data/admin/adminContent.schema";

const VALID_TYPES = new Set<string>(Object.keys(ADMIN_CONTENT_TYPE_LABELS));
const VALID_STATUS = new Set<string>(Object.keys(ADMIN_CONTENT_STATUS_LABELS));
const VALID_THUMBNAILS = new Set<string>([
  "guide",
  "qa",
  "symptom",
  "photo_analysis",
  "caution",
  "compare",
  "spec_inquiry",
  "shopping",
  "brand",
  "default",
]);

export type WorkbenchValidationIssue = {
  id: string;
  field: string;
  message: string;
  severity: "error" | "warning";
};

export type WorkbenchValidationResult = {
  valid: boolean;
  issues: WorkbenchValidationIssue[];
  itemCount: number;
  duplicateIds: string[];
};

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export function validateContentWorkbench(data: unknown): WorkbenchValidationResult {
  const issues: WorkbenchValidationIssue[] = [];
  const duplicateIds: string[] = [];

  if (!Array.isArray(data)) {
    return {
      valid: false,
      issues: [{ id: "-", field: "root", message: "최상위가 배열이 아닙니다.", severity: "error" }],
      itemCount: 0,
      duplicateIds: [],
    };
  }

  const seen = new Map<string, number>();

  for (let i = 0; i < data.length; i++) {
    const raw = data[i] as Partial<AdminContentItem>;
    const row = String(i + 1);

    if (!raw || typeof raw !== "object") {
      issues.push({ id: row, field: "item", message: "항목 형식이 올바르지 않습니다.", severity: "error" });
      continue;
    }

    const id = raw.id?.trim() ?? "";
    if (!id) {
      issues.push({ id: row, field: "id", message: "id가 비어 있습니다.", severity: "error" });
    } else {
      seen.set(id, (seen.get(id) ?? 0) + 1);
    }

    if (!raw.title?.trim()) {
      issues.push({ id: id || row, field: "title", message: "제목이 비어 있습니다.", severity: "error" });
    }

    if (raw.type && !VALID_TYPES.has(raw.type)) {
      issues.push({ id: id || row, field: "type", message: `유효하지 않은 type: ${raw.type}`, severity: "error" });
    }

    if (raw.status && !VALID_STATUS.has(raw.status)) {
      issues.push({
        id: id || row,
        field: "status",
        message: `유효하지 않은 status: ${raw.status}`,
        severity: "error",
      });
    }

    if (raw.thumbnailType && !VALID_THUMBNAILS.has(raw.thumbnailType)) {
      issues.push({
        id: id || row,
        field: "thumbnailType",
        message: `유효하지 않은 thumbnailType: ${raw.thumbnailType}`,
        severity: "warning",
      });
    }

    for (const field of ["relatedVehicleIds", "relatedBatteryIds", "relatedSpecIds", "relatedGuideIds", "relatedQaIds", "tags"] as const) {
      const val = raw[field];
      if (val !== undefined && !isStringArray(val)) {
        issues.push({
          id: id || row,
          field,
          message: `${field}는 문자열 배열이어야 합니다.`,
          severity: "error",
        });
      }
    }

    if (!raw.sourceFile?.trim()) {
      issues.push({
        id: id || row,
        field: "sourceFile",
        message: "sourceFile이 비어 있습니다. 원본 추적을 위해 입력을 권장합니다.",
        severity: "warning",
      });
    }
  }

  for (const [id, count] of seen) {
    if (count > 1) duplicateIds.push(id);
  }
  for (const id of duplicateIds) {
    issues.push({ id, field: "id", message: "중복 id입니다.", severity: "error" });
  }

  const errors = issues.filter((x) => x.severity === "error");
  return {
    valid: errors.length === 0,
    issues,
    itemCount: data.length,
    duplicateIds,
  };
}

export function itemsWithValidationFlags(
  items: AdminContentItem[],
  validation: WorkbenchValidationResult,
): (AdminContentItem & { hasValidationIssue?: boolean })[] {
  const badIds = new Set(validation.issues.filter((i) => i.severity === "error").map((i) => i.id));
  return items.map((item) => ({
    ...item,
    hasValidationIssue: badIds.has(item.id),
    status: badIds.has(item.id) ? ("needs_review" as AdminContentStatus) : item.status,
  }));
}

export type { AdminContentType, AdminContentThumbnailType };
