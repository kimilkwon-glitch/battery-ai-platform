"use client";

import { useEffect } from "react";
import { recordBatteryClick, recordContentView, recordVehicleClick } from "@/lib/activity";

type Props = {
  articleId: string;
  vehicleIds: string[];
  batteryIds: string[];
};

/** 가이드 상세 조회 시 관련 차량·배터리·콘텐츠 조회를 localStorage에 기록 */
export function GuideActivityTracker({ articleId, vehicleIds, batteryIds }: Props) {
  useEffect(() => {
    recordContentView(articleId);
    vehicleIds.forEach((id) => recordVehicleClick(id));
    batteryIds.forEach((id) => recordBatteryClick(id));
  }, [articleId, vehicleIds, batteryIds]);

  return null;
}
