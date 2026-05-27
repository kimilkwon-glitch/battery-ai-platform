"use client";

import { SmartNextActions } from "@/components/common/SmartNextActions";
import { buildContextFromGuide } from "@/lib/navigationGraph";

export function GuideNavFooter({ articleId }: { articleId: string }) {
  return <SmartNextActions context={buildContextFromGuide(articleId)} limit={5} />;
}
