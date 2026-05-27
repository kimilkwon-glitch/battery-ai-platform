import Link from "next/link";
import { bm } from "@/lib/design-tokens";

type Props = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
  padding?: boolean;
};

export function SmartCard({ children, className = "", href, interactive = false, padding = true }: Props) {
  const shell = `${interactive || href ? bm.cardInteractive : bm.card} ${padding ? bm.cardPad : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={`block ${shell}`}>
        {children}
      </Link>
    );
  }
  return <section className={shell}>{children}</section>;
}
