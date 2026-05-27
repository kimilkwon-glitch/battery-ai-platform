"use client";

import { useEffect } from "react";
import { recordBatteryClick } from "@/lib/activity";

export function BatteryActivityTracker({ code }: { code: string }) {
  useEffect(() => {
    if (code) recordBatteryClick(code);
  }, [code]);

  return null;
}
