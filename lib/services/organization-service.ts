// ============================================================================
// Organization Service
// POST /organizations          — create a new organization (village/community)
// PUT  /auth/users/{user_id}   — attach a user to an organization
// ============================================================================

import { apiClient } from "@/lib/api/client";

export interface OrganizationResponse {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export async function createOrganization(name: string): Promise<OrganizationResponse> {
  return apiClient.post<OrganizationResponse>("/organizations", { name });
}

export async function assignUserOrganization(userId: string, organizationId: string): Promise<void> {
  await apiClient.put(`/auth/users/${userId}`, { organization_id: organizationId });
}
