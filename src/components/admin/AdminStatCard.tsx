import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  href?: string;
  tone?: "default" | "warning" | "danger" | "info";
  sublabel?: string;
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-slate-900",
  warning: "text-amber-700",
  danger: "text-red-700",
  info: "text-blue-700",
};

export function AdminStatCard({ label, value, href, tone = "default", sublabel }: Props) {
  const inner = (
    <Card className={cn(href && "transition-shadow hover:shadow-md")}>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-semibold text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-black", toneClass[tone])}>{value}</p>
        {sublabel ? <p className="mt-1 text-[10px] text-slate-500">{sublabel}</p> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
