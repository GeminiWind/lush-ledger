import type { AuthSettingsPayload, AuthUser, LoginInput, RegisterInput } from "@/features/auth/types";

const toAuthUser = (payload: AuthSettingsPayload): AuthUser | null => {
  if (!payload.settings?.email) {
    return null;
  }

  return {
    name: payload.settings.name || "",
    email: payload.settings.email,
  };
};

export const fetchAuthUser = async (): Promise<AuthUser | null> => {
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

  const payload = (await response.json()) as AuthSettingsPayload;
  return toAuthUser(payload);
};

const extractError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
};

export const login = async (values: LoginInput) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(await extractError(response, "Login failed."));
  }
};

export const register = async (values: RegisterInput) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(await extractError(response, "Registration failed."));
  }
};
