// ============================================================================
// Location Service
// POST /guard/location  — guard's phone reports its current GPS position
// GET  /guards/locations — admin polls for latest position of on-duty guards
// ============================================================================

import { apiClient } from "@/lib/api/client";
import { GuardLocationResponse } from "@/types/auth";

export async function uploadGuardLocation(
  userId: string,
  latitude: number,
  longitude: number
): Promise<GuardLocationResponse> {
  return apiClient.post<GuardLocationResponse>("/guard/location", {
    user_id: userId,
    latitude,
    longitude,
  });
}

export async function getGuardLocations(): Promise<GuardLocationResponse[]> {
  return apiClient.get<GuardLocationResponse[]>("/guards/locations");
}


















