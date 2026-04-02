"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type AuthUser = {
  name: string;
  email: string;
};

type SettingsPayload = {
  settings?: {
    name?: string;
    email?: string;
  };
};

type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

const toAuthUser = (payload: SettingsPayload): AuthUser | null => {
  if (!payload.settings?.email) {
    return null;
  }

  return {
    name: payload.settings.name || "",
    email: payload.settings.email,
  };
};

const fetchAuthUser = async (): Promise<AuthUser | null> => {
  const response = await fetch("/api/settings", {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Could not load user profile.");
  }

  const payload = (await response.json()) as SettingsPayload;
  return toAuthUser(payload);
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const authUserQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginInput) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed.");
      }

      const user = await fetchAuthUser();
      queryClient.setQueryData(["auth-user"], user);
      return user;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterInput) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed.");
      }

      const user = await fetchAuthUser();
      queryClient.setQueryData(["auth-user"], user);
      return user;
    },
  });

  return {
    user: authUserQuery.data || null,
    isAuthenticated: Boolean(authUserQuery.data?.email),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoadingUser: authUserQuery.isLoading,
  };
};

export type { AuthUser, LoginInput, RegisterInput };
