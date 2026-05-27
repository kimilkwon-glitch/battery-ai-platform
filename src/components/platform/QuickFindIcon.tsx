import { ContentUiIcon } from "@/components/content/ContentUiIcon";
import type { ContentUiIconKey } from "@/lib/content-ui-icons";

const QUICK_FIND_ICONS: Record<"car" | "battery" | "fuel" | "camera" | "symptom", ContentUiIconKey> = {
  car: "spec-guide",
  battery: "upgrade",
  fuel: "spec-guide",
  camera: "photo-analysis",
  symptom: "start-delay",
};

export function QuickFindIcon({ type }: { type: keyof typeof QUICK_FIND_ICONS }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50/90 ring-1 ring-slate-100/90 transition group-hover:bg-white group-hover:ring-blue-100/80">
      <ContentUiIcon
        className="!h-8 !w-8 !bg-transparent !shadow-none !ring-0"
        iconKey={QUICK_FIND_ICONS[type]}
        rounded="lg"
        size={32}
      />
    </span>
  );
}
