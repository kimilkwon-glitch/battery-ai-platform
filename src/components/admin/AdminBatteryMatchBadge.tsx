import { Badge } from "@/components/ui/badge";
import type { BatteryMatchStatus } from "@/types/admin";

const LABELS: Record<BatteryMatchStatus, string> = {
  matched: "매칭 완료",
  unmatched: "매칭 미완료",
};

const VARIANTS: Record<BatteryMatchStatus, "success" | "warning"> = {
  matched: "success",
  unmatched: "warning",
};

export function AdminBatteryMatchBadge({ status }: { status: BatteryMatchStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
