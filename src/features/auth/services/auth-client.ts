import type {
  AuthErrorPayload,
  AuthFieldErrors,
  AuthSettingsPayload,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/features/auth/types";

export class AuthRequestError extends Error {
  status: number;
  fieldErrors?: AuthFieldErrors;

  constructor(message: string, status: number, fieldErrors?: AuthFieldErrors) {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

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
    const data = (await response.json()) as AuthErrorPayload;
    const firstFieldError = data.errors ? Object.values(data.errors)[0] : undefined;

    return {
      message: data.error || firstFieldError || fallback,
      fieldErrors: data.errors,
    };
  } catch {
    return { message: fallback, fieldErrors: undefined };
  }
};

export const login = async (values: LoginInput) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const parsed = await extractError(response, "Login failed.");
    throw new AuthRequestError(parsed.message, response.status, parsed.fieldErrors);
  }
};

export const register = async (values: RegisterInput) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const parsed = await extractError(response, "Registration failed.");
    throw new AuthRequestError(parsed.message, response.status, parsed.fieldErrors);
  }
};
