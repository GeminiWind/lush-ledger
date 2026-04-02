"use client";

import { useAuthContext } from "@/features/auth/context/AuthContext";
import type { AuthUser, LoginInput, RegisterInput } from "@/features/auth/types";

export const useAuth = useAuthContext;

export type { AuthUser, LoginInput, RegisterInput };
