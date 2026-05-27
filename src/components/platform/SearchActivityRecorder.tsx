"use client";

import { useEffect } from "react";
import { recordSearch } from "@/lib/activity";

type Props = {
  query: string;
  matchedVehicle?: string;
  matchedBattery?: string;
  failed?: boolean;
  suggestion?: string;
};

export function SearchActivityRecorder({ query, matchedVehicle, matchedBattery, failed, suggestion }: Props) {
  useEffect(() => {
    if (!query.trim()) return;
    recordSearch(query, { matchedVehicle, matchedBattery, failed, suggestion });
  }, [query, matchedVehicle, matchedBattery, failed, suggestion]);

  return null;
}
