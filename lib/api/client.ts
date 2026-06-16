import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/auth/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tite2-fyp-be.hf.space";
console.log("[apiClient] API_URL:", API_URL);


export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const axiosClient = axios.create({ baseURL: API_URL });

axiosClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Auto-propagate the user's organization to any request that didn't
  // already set it explicitly, so org-scoped endpoints (GET /guards/locations,
  // /auth/users, /shifts, etc.) get filtered without every call site having
  // to remember to pass organization_id.
  if (user?.organizationId && !config.params?.organization_id) {
    config.params = { ...config.params, organization_id: user.organizationId };
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as unknown;
      const message =
        typeof data === "object" && data && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : error.message;
      throw new ApiError(error.response.status, message, data);
    }
    throw new ApiError(0, error.message, null);
  }
);

interface RequestOptions {
  token?: string;
  headers?: Record<string, string>;
}

function withConfig(options?: RequestOptions): AxiosRequestConfig {
  if (!options) return {};
  const { token, headers } = options;
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
}

export const apiClient = {
  get: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const res = await axiosClient.get<T>(path, withConfig(options));
    return res.data;
  },
  post: async <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> => {
    const res = await axiosClient.post<T>(path, body, withConfig(options));
    return res.data;
  },
  put: async <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> => {
    const res = await axiosClient.put<T>(path, body, withConfig(options));
    return res.data;
  },
  delete: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const res = await axiosClient.delete<T>(path, withConfig(options));
    return res.data;
  },
};
