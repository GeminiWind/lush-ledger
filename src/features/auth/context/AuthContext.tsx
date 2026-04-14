"use client";

import { createContext, useContext, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  AuthRequestError,
  fetchAuthUser,
  login as loginRequest,
  register as registerRequest,
} from "@/features/auth/services/auth-client";
import { isAuthRoute, isPrivateRoute, resolvePostAuthRedirect, resolvePrivateRedirect } from "@/features/auth/routes";
import type { AuthContextValue, LoginInput, RegisterInput } from "@/features/auth/types";

const AuthContext = createContext<AuthContextValue | null>(null);

const getNextParam = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("next");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const authUserQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginInput) => {
      await loginRequest(values);
      const user = await fetchAuthUser();
      queryClient.setQueryData(["auth-user"], user);
      return user;
    },
    onSuccess: () => {
      router.push(resolvePostAuthRedirect(getNextParam()));
      router.refresh();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterInput) => {
      try {
        await registerRequest(values);
      } catch (error) {
        if (error instanceof AuthRequestError) {
          if (error.status === 409) {
            const mapped = {
              ...error.fieldErrors,
              email:
                error.fieldErrors?.email ||
                "Email already exists. Please sign in with this email.",
            };

            throw new AuthRequestError(
              "Email already exists. Please sign in with this email.",
              error.status,
              mapped
            );
          }

          if (error.fieldErrors?.password) {
            throw new AuthRequestError(
              error.fieldErrors.password,
              error.status,
              error.fieldErrors
            );
          }
        }

        throw error;
      }

      const user = await fetchAuthUser();
      queryClient.setQueryData(["auth-user"], user);
      return user;
    },
    onSuccess: () => {
      router.push(resolvePostAuthRedirect(getNextParam()));
      router.refresh();
    },
  });

  useEffect(() => {
    if (authUserQuery.isLoading) {
      return;
    }

    if (authUserQuery.data?.email && isAuthRoute(pathname)) {
      router.replace(resolvePostAuthRedirect(getNextParam()));
      return;
    }

    if (authUserQuery.data?.email || !isPrivateRoute(pathname)) {
      return;
    }

    const redirectPath = resolvePrivateRedirect(pathname);
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [authUserQuery.data?.email, authUserQuery.isLoading, pathname, router]);

  const value: AuthContextValue = {
    user: authUserQuery.data || null,
    isAuthenticated: Boolean(authUserQuery.data?.email),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoadingUser: authUserQuery.isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
