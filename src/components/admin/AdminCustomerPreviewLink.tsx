import Link from "next/link";
import { isCustomerPreviewHref } from "@/lib/admin/admin-status-tokens";

type Props = {
  href: string;
  className?: string;
  showUrl?: boolean;
};

/** 고객 화면 미리보기 — 항상 새 탭 */
export function AdminCustomerPreviewLink({ href, className, showUrl }: Props) {
  if (!isCustomerPreviewHref(href)) {
    return (
      <Link href={href} className={className ?? "admin-link-internal"}>
        {href}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "admin-link-preview"}
    >
      <span>고객 화면 미리보기</span>
      <span className="admin-link-preview__icon" aria-hidden>
        ↗
      </span>
      {showUrl ? <span className="admin-link-preview__url">{href}</span> : null}
    </a>
  );
}
