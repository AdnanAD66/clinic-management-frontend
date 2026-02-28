"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useCallback } from "react";
import type { ApiResponse } from "@/lib/types";

export function useApi() {
  const { token, logout } = useAuth();

  const apiFetch = useCallback(
    async <T = unknown>(
      url: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
          logout();
          window.location.href = "/login";
          return { success: false, message: "Session expired. Please log in again." };
        }

        const data: ApiResponse<T> = await response.json();
        return data;
      } catch {
        return { success: false, message: "Something went wrong. Please try again." };
      }
    },
    [token, logout]
  );

  return { apiFetch };
}
