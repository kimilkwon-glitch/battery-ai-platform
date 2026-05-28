import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { bm } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type Props<T extends ElementType = "div"> = {
  /** 좌측 이미지 패널 — `media`는 HTML 속성과 충돌해 imagePanel 사용 */
  imagePanel: ReactNode;
  children: ReactNode;
  className?: string;
  mediaClassName?: string;
  bodyClassName?: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/** md+ 좌측 이미지 / 우측 정보 · 모바일 상하 stack */
export function CardHorizontalLayout<T extends ElementType = "div">({
  imagePanel,
  children,
  className = "",
  mediaClassName = "",
  bodyClassName = "",
  as,
  ...rest
}: Props<T>) {
  const Comp = (as ?? "div") as ElementType;

  return (
    <Comp className={cn(bm.cardHorizontal, className)} {...rest}>
      <div className={cn(bm.cardHorizontalMedia, mediaClassName)}>{imagePanel}</div>
      <div className={cn(bm.cardHorizontalBody, bodyClassName)}>{children}</div>
    </Comp>
  );
}
