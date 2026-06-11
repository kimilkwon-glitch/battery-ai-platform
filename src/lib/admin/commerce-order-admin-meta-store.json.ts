import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export type CommerceOrderAdminMeta = {
  orderId: string;
  adminMemo?: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  courierCode?: string;
  shippedAt?: string;
  lastDeliveryCheckedAt?: string;
  lastDeliveryStatus?: string | null;
  lastDeliveryMessage?: string | null;
  updatedAt: string;
};

type Payload = { metas: CommerceOrderAdminMeta[] };

const DATA_PATH = path.join(process.cwd(), ".data", "commerce-order-admin-meta.json");

async function loadPayload(): Promise<Payload> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as Payload;
  } catch {
    return { metas: [] };
  }
}

async function savePayload(payload: Payload): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(payload, null, 2), "utf8");
}

export async function commerceOrderAdminMetaGet(
  orderId: string,
): Promise<CommerceOrderAdminMeta | null> {
  const payload = await loadPayload();
  return payload.metas.find((m) => m.orderId === orderId) ?? null;
}

export async function commerceOrderAdminMetaListAll(): Promise<CommerceOrderAdminMeta[]> {
  const payload = await loadPayload();
  return payload.metas;
}

export async function commerceOrderAdminMetaUpsert(
  orderId: string,
  patch: Partial<Omit<CommerceOrderAdminMeta, "orderId" | "updatedAt">>,
): Promise<CommerceOrderAdminMeta> {
  const payload = await loadPayload();
  const now = new Date().toISOString();
  const idx = payload.metas.findIndex((m) => m.orderId === orderId);
  const next: CommerceOrderAdminMeta = {
    orderId,
    ...(idx >= 0 ? payload.metas[idx] : {}),
    ...patch,
    updatedAt: now,
  };
  if (idx >= 0) payload.metas[idx] = next;
  else payload.metas.push(next);
  await savePayload(payload);
  return next;
}
