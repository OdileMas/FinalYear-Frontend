// ============================================================================
// User Service — matches FastAPI /auth/users routes exactly
// organization_id is auto-injected into GET query params by the apiClient
// interceptor, but POST/PUT bodies need it set explicitly (see shift-service.ts).
// ============================================================================

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/auth-store";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string; // "admin" | "guard"
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  organization_id: string | null;
}

export async function listUsers(): Promise<BackendUser[]> {
  return apiClient.get<BackendUser[]>("/auth/users");
}

export async function listGuards(): Promise<BackendUser[]> {
  const users = await listUsers();
  return users.filter((u) => u.role === "guard");
}

export async function createGuard(data: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}): Promise<BackendUser> {
  const organizationId = useAuthStore.getState().user?.organizationId ?? null;
  return apiClient.post<BackendUser>("/auth/users", {
    ...data,
    role: "guard",
    organization_id: organizationId,
  });
}

export async function updateUser(
  userId: string,
  data: { name?: string; phone?: string | null; is_active?: boolean }
): Promise<BackendUser> {
  return apiClient.put<BackendUser>(`/auth/users/${userId}`, data);
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiClient.delete(`/auth/users/${userId}`);
}
