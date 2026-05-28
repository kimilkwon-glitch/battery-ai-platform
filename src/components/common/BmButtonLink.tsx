import Link from "next/link";
import type { ComponentProps } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "link";

const VARIANT_MAP: Record<
  Variant,
  NonNullable<ComponentProps<typeof Button>["variant"]>
> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  link: "link",
};

const SIZE_CLASS = {
  default: "",
  sm: "h-8 min-h-8 px-3 text-xs font-bold",
  xs: "h-7 min-h-7 px-2.5 text-[10px] font-bold",
} as const;

/** shadcn Button + Link — CTA 위계 통일 */
export function BmButtonLink({
  href,
  variant = "primary",
  size = "default",
  className,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant={VARIANT_MAP[variant]}
      className={cn(
        variant === "primary" &&
          "bg-[var(--bm-primary)] text-white hover:bg-[var(--bm-primary-hover)]",
        variant === "secondary" && "font-bold text-[var(--bm-text)]",
        SIZE_CLASS[size],
        className,
      )}
    >
      <Link href={href} {...rest}>
        {children}
      </Link>
    </Button>
  );
}

export { buttonVariants };
