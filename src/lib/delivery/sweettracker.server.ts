import "server-only";

import { fetchSweetTrackerTracking as fetchImpl } from "@/lib/delivery/sweettracker-fetch";

export { isSweetTrackerConfigured } from "@/lib/delivery/sweettracker-fetch";
export { mockDeliveryTrackResult, normalizeSweetTrackerResponse } from "@/lib/delivery/sweettracker-normalize";

export const fetchSweetTrackerTracking = fetchImpl;
