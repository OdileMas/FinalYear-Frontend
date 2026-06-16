// ============================================================================
// Shift Service — matches FastAPI /shifts routes exactly
//
// Note: the apiClient interceptor only auto-injects organization_id into the
// query string (for GET-style filtering). POST /shifts expects organization_id
// as a JSON body field instead, so createShift() has to set it explicitly.
// ============================================================================

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/auth-store";

export interface ShiftResponse {
  id: string;
  name: string;
  shift_start: string; // "HH:MM:SS"
  shift_end: string; // "HH:MM:SS"
  days_of_week: number[] | null; // 0=Mon … 6=Sun, null = every day
  is_active: boolean;
  created_at: string;
  organization_id: string | null;
}

export interface ShiftAssignmentResponse {
  id: string;
  shift_id: string;
  user_id: string;
  guard_name: string;
  shift_name: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface OnDutyGuard {
  guard_name: string;
  phone: string | null;
  shift_name: string;
  shift_start: string;
  shift_end: string;
  assigned_since: string;
}

export async function createShift(data: {
  name: string;
  shift_start: string;
  shift_end: string;
  days_of_week?: number[] | null;
}): Promise<ShiftResponse> {
  const organizationId = useAuthStore.getState().user?.organizationId ?? null;
  return apiClient.post<ShiftResponse>("/shifts", { ...data, organization_id: organizationId });
}

export async function listShifts(): Promise<ShiftResponse[]> {
  return apiClient.get<ShiftResponse[]>("/shifts");
}

export async function deactivateShift(shiftId: string): Promise<void> {
  await apiClient.delete(`/shifts/${shiftId}`);
}

export async function assignGuardToShift(
  shiftId: string,
  data: { user_id: string; start_date: string; end_date?: string | null }
): Promise<ShiftAssignmentResponse> {
  return apiClient.post<ShiftAssignmentResponse>(`/shifts/${shiftId}/assign`, data);
}

export async function listShiftGuards(shiftId: string): Promise<ShiftAssignmentResponse[]> {
  return apiClient.get<ShiftAssignmentResponse[]>(`/shifts/${shiftId}/guards`);
}

export async function unassignGuard(assignmentId: string): Promise<void> {
  await apiClient.delete(`/shifts/assignments/${assignmentId}`);
}

export async function getOnDutyGuards(): Promise<OnDutyGuard[]> {
  return apiClient.get<OnDutyGuard[]>("/shifts/on-duty");
}
