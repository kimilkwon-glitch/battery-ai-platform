import "server-only";

import { filterAdminTestInquiries } from "@/lib/admin/admin-test-data-filter";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import {
  isProductQnaSource,
  normalizeInquiryCategory,
  type CustomerInquiryRecord,
  type InquiryCategory,
  type InquirySource,
  type InquiryStatus,
} from "@/types/customer-inquiry";

type InquiryRow = {
  id: string;
  status: string;
  category: string;
  name: string;
  contact: string;
  vehicle: string | null;
  region: string | null;
  message: string;
  title: string | null;
  battery_code: string | null;
  product_code: string | null;
  product_name: string | null;
  return_option: string | null;
  page_url: string | null;
  source: string | null;
  inquiry_type: string | null;
  coupon_code: string | null;
  admin_memo: string | null;
  is_secret: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
};

function newId(): string {
  return `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToRecord(row: InquiryRow): CustomerInquiryRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as InquiryStatus,
    category: row.category as InquiryCategory,
    name: row.name,
    contact: row.contact,
    vehicle: row.vehicle ?? undefined,
    region: row.region ?? undefined,
    message: row.message,
    title: row.title ?? undefined,
    batteryCode: row.battery_code ?? undefined,
    productCode: row.product_code ?? undefined,
    productName: row.product_name ?? undefined,
    returnOption: row.return_option ?? undefined,
    pageUrl: row.page_url ?? undefined,
    source: (row.source as InquirySource) ?? undefined,
    inquiryType: row.inquiry_type ?? undefined,
    couponCode: row.coupon_code ?? undefined,
    adminMemo: row.admin_memo ?? "",
    isSecret: row.is_secret,
    hidden: row.hidden,
  };
}

export type InquiryCreateInput = {
  name: string;
  contact: string;
  vehicle?: string;
  region?: string;
  message: string;
  title?: string;
  batteryCode?: string;
  productCode?: string;
  productName?: string;
  returnOption?: string;
  pageUrl?: string;
  source?: InquirySource;
  category?: InquiryCategory;
  inquiryType?: string;
  couponCode?: string;
  isSecret?: boolean;
};

export type InquiryListFilters = {
  status?: InquiryStatus | "all" | null;
  category?: InquiryCategory | "all" | null;
  batteryCode?: string | null;
  source?: InquirySource | null;
  productQnaOnly?: boolean;
  q?: string | null;
  limit?: number;
};

export async function inquiryCreate(input: InquiryCreateInput): Promise<CustomerInquiryRecord> {
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const category = input.category ?? normalizeInquiryCategory(input.inquiryType);
  const record: CustomerInquiryRecord = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    category,
    name: input.name.trim() || "고객",
    contact: input.contact.trim(),
    vehicle: input.vehicle?.trim() || undefined,
    region: input.region?.trim() || undefined,
    message: input.message.trim(),
    title: input.title?.trim() || undefined,
    batteryCode: input.batteryCode?.trim() || undefined,
    productCode: input.productCode?.trim() || input.batteryCode?.trim() || undefined,
    productName: input.productName?.trim() || undefined,
    returnOption: input.returnOption?.trim() || undefined,
    pageUrl: input.pageUrl?.trim() || undefined,
    source: input.source,
    inquiryType: input.inquiryType?.trim() || undefined,
    couponCode: input.couponCode?.trim() || undefined,
    adminMemo: "",
    isSecret: input.isSecret === true,
    hidden: false,
  };

  await sql`
    INSERT INTO customer_inquiries (
      id, status, category, name, contact, vehicle, region, message, title,
      battery_code, product_code, product_name, return_option, page_url, source,
      inquiry_type, coupon_code, admin_memo, is_secret, hidden, created_at, updated_at
    ) VALUES (
      ${record.id}, ${record.status}, ${record.category}, ${record.name}, ${record.contact},
      ${record.vehicle ?? null}, ${record.region ?? null}, ${record.message},
      ${record.title ?? null}, ${record.batteryCode ?? null}, ${record.productCode ?? null},
      ${record.productName ?? null}, ${record.returnOption ?? null}, ${record.pageUrl ?? null},
      ${record.source ?? null}, ${record.inquiryType ?? null}, ${record.couponCode ?? null},
      ${record.adminMemo}, ${record.isSecret}, ${record.hidden}, ${record.createdAt}, ${record.updatedAt}
    )
  `;
  return record;
}

export async function inquiryList(
  filters: InquiryListFilters = {},
): Promise<CustomerInquiryRecord[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const limit = filters.limit ?? 500;
  let rows = (await sql`
    SELECT * FROM customer_inquiries ORDER BY created_at DESC LIMIT ${limit * 2}
  `) as InquiryRow[];

  let records = rows.map(rowToRecord);
  records = filterAdminTestInquiries(records);

  const status = filters.status?.trim();
  if (status && status !== "all") records = records.filter((r) => r.status === status);
  const category = filters.category?.trim();
  if (category && category !== "all") records = records.filter((r) => r.category === category);
  const batteryCode = filters.batteryCode?.trim().toUpperCase();
  if (batteryCode) records = records.filter((r) => r.batteryCode?.trim().toUpperCase() === batteryCode);
  if (filters.productQnaOnly === true) {
    records = records.filter((r) => isProductQnaSource(r.source) && !r.hidden);
  } else if (filters.productQnaOnly === false) {
    records = records.filter((r) => !isProductQnaSource(r.source) && r.source !== "batterytalk");
  }
  if (filters.source) records = records.filter((r) => r.source === filters.source);
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    records = records.filter((r) => {
      const hay = [r.name, r.contact, r.vehicle, r.message, r.batteryCode, r.inquiryType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return records.slice(0, limit);
}

export async function inquiryGetById(id: string): Promise<CustomerInquiryRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM customer_inquiries WHERE id = ${id} LIMIT 1`) as InquiryRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

async function inquiryPatch(
  id: string,
  patch: Partial<CustomerInquiryRecord>,
): Promise<CustomerInquiryRecord | null> {
  const prev = await inquiryGetById(id);
  if (!prev) return null;
  const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
  const sql = getSql();
  await sql`
    UPDATE customer_inquiries SET
      status = ${next.status},
      category = ${next.category},
      name = ${next.name},
      contact = ${next.contact},
      vehicle = ${next.vehicle ?? null},
      region = ${next.region ?? null},
      message = ${next.message},
      title = ${next.title ?? null},
      battery_code = ${next.batteryCode ?? null},
      product_code = ${next.productCode ?? null},
      product_name = ${next.productName ?? null},
      return_option = ${next.returnOption ?? null},
      page_url = ${next.pageUrl ?? null},
      source = ${next.source ?? null},
      inquiry_type = ${next.inquiryType ?? null},
      coupon_code = ${next.couponCode ?? null},
      admin_memo = ${next.adminMemo ?? ""},
      is_secret = ${next.isSecret === true},
      hidden = ${next.hidden === true},
      updated_at = ${next.updatedAt}
    WHERE id = ${id}
  `;
  return next;
}

export async function inquiryUpdateStatus(
  id: string,
  status: InquiryStatus,
): Promise<CustomerInquiryRecord | null> {
  return inquiryPatch(id, { status });
}

export async function inquiryUpdateMemo(
  id: string,
  adminMemo: string,
): Promise<CustomerInquiryRecord | null> {
  return inquiryPatch(id, { adminMemo: adminMemo.trim() });
}

export async function inquirySetHidden(
  id: string,
  hidden: boolean,
): Promise<CustomerInquiryRecord | null> {
  return inquiryPatch(id, { hidden });
}
