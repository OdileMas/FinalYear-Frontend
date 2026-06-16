import { apiClient, ApiError } from "@/lib/api/client";
import { UserRole } from "@/types/auth";

// Backend roles ("admin" / "guard") vs frontend roles (HEAD_OF_SECURITY / GUARD)
const BACKEND_TO_FRONTEND_ROLE: Record<string, UserRole> = {
  admin: "HEAD_OF_SECURITY",
  guard: "GUARD",
};

const FRONTEND_TO_BACKEND_ROLE: Record<UserRole, string> = {
  HEAD_OF_SECURITY: "admin",
  GUARD: "guard",
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

// Actual FastAPI response: only the JWT, no user data.
// Token payload: { sub: <user id>, role: <"admin" | "guard">, exp }
interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Actual FastAPI response for register: token + the created user.
interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
  };
}

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const data = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  const payload = decodeJwt(data.access_token);
  const role = BACKEND_TO_FRONTEND_ROLE[payload.role] ?? "GUARD";

  return {
    token: data.access_token,
    user: {
      id: payload.sub,
      name: email,
      email,
      role,
    },
  };
}

export async function signupUser(data: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AuthResult> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", {
    name: data.fullName,
    email: data.email,
    password: data.password,
    role: FRONTEND_TO_BACKEND_ROLE[data.role],
  });

  const role = BACKEND_TO_FRONTEND_ROLE[response.user.role] ?? data.role;

  return {
    token: response.access_token,
    user: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role,
      phone: response.user.phone,
    },
  };
}

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
