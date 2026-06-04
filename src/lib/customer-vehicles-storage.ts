export type CustomerVehicleRecord = {
  id: string;
  slug: string;
  displayName: string;
  href: string;
  registeredAt: string;
  year?: string;
  yearRange?: string;
  fuel?: string;
  fuelHint?: string;
  recommendedBattery?: string;
  batteryOptions?: string[];
  source?: string;
};

const STORAGE_KEY = "bm-my-vehicles-v1";

function readAll(): CustomerVehicleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerVehicleRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CustomerVehicleRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function getCustomerVehicles(): CustomerVehicleRecord[] {
  return readAll().sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

export function addCustomerVehicle(
  input: Omit<CustomerVehicleRecord, "id" | "registeredAt"> & { id?: string },
): CustomerVehicleRecord {
  const row: CustomerVehicleRecord = {
    id: input.id ?? `${input.slug}-${Date.now()}`,
    slug: input.slug,
    displayName: input.displayName,
    href: input.href,
    year: input.year ?? input.yearRange,
    yearRange: input.yearRange ?? input.year,
    fuel: input.fuel,
    fuelHint: input.fuelHint ?? input.fuel,
    recommendedBattery: input.recommendedBattery,
    batteryOptions: input.batteryOptions?.length ? input.batteryOptions : undefined,
    source: input.source,
    registeredAt: new Date().toISOString(),
  };
  const existing = readAll().filter((v) => v.slug !== row.slug);
  writeAll([row, ...existing]);
  return row;
}

export function removeCustomerVehicle(id: string) {
  writeAll(readAll().filter((v) => v.id !== id));
}
