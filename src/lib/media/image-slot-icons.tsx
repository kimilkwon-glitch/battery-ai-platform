import {
  AlertTriangle,
  Battery,
  BookOpen,
  Camera,
  Car,
  ClipboardCheck,
  GitCompare,
  MapPin,
  Package,
  ScanSearch,
  Store,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { IconCar, IconPhotoScan, IconTool, IconTruckDelivery } from "@tabler/icons-react";
import type { ComponentType } from "react";

type IconProps = { className?: string; stroke?: number };

function pickLucide(purpose: string, assetKey: string): LucideIcon {
  if (purpose.includes("store") || assetKey.includes("store")) return Store;
  if (purpose.includes("outbound") || assetKey.includes("field")) return Truck;
  if (purpose.includes("inspection") || purpose.includes("tester")) return Wrench;
  if (purpose.includes("delivery") || purpose.includes("pack")) return Package;
  if (purpose.includes("label")) return ScanSearch;
  if (purpose.includes("symptom") || purpose.includes("blackbox")) return AlertTriangle;
  if (purpose.includes("vehicle") || assetKey.includes("vehicle")) return Car;
  if (purpose.includes("battery") || purpose.includes("product")) return Battery;
  if (purpose.includes("photo") || purpose.includes("guide")) return Camera;
  if (purpose.includes("compare")) return GitCompare;
  if (purpose.includes("checklist")) return ClipboardCheck;
  if (purpose.includes("guide")) return BookOpen;
  if (purpose.includes("region") || purpose.includes("map")) return MapPin;
  return Camera;
}

function pickTabler(purpose: string, assetKey: string): ComponentType<IconProps> | null {
  if (purpose.includes("outbound") || assetKey.includes("outbound")) return IconTruckDelivery;
  if (purpose.includes("vehicle") && assetKey.includes("commercial")) return IconCar;
  if (purpose.includes("photo") || purpose.includes("scan")) return IconPhotoScan;
  if (purpose.includes("inspection") || purpose.includes("work")) return IconTool;
  return null;
}

export function ImageSlotPurposeIcon({
  purpose,
  assetKey,
  className = "size-4",
}: {
  purpose: string;
  assetKey: string;
  className?: string;
}) {
  const Tabler = pickTabler(purpose, assetKey);
  if (Tabler) {
    return <Tabler className={className} stroke={2} />;
  }
  const Lucide = pickLucide(purpose, assetKey);
  return <Lucide className={className} strokeWidth={2} aria-hidden />;
}
