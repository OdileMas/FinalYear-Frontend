"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import { getRedirectPath } from "@/lib/hooks/useAuth";
import { UserRole } from "@/types/auth";

// Redirects to login if unauthenticated, or to the user's own dashboard
// if their role doesn't match the section being viewed.
export function useRequireAuth(requiredRole: UserRole) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for the persisted session to load from localStorage before
    // deciding the user is logged out — otherwise every refresh briefly
    // sees token/user as null and redirects to login.
    if (!hasHydrated) return;

    if (!token || !user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== requiredRole) {
      router.replace(getRedirectPath(user.role));
      return;
    }
    setIsAuthorized(true);
  }, [token, user, hasHydrated, requiredRole, router]);

  return { user, isAuthorized };
}
