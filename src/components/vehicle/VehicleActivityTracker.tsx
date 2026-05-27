"use client";

import { useEffect } from "react";
import { recordVehicleClick } from "@/lib/activity";

export function VehicleActivityTracker({ vehicleId }: { vehicleId: string }) {
  useEffect(() => {
    if (vehicleId) recordVehicleClick(vehicleId);
  }, [vehicleId]);

  return null;
}
