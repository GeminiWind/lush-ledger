export type AuthUser = {
  name: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

export type AuthSettingsPayload = {
  settings?: {
    name?: string;
    email?: string;
  };
};

export type AuthFieldErrors = Record<string, string>;

export type AuthErrorPayload = {
  error?: string;
  errors?: AuthFieldErrors;
  retryAfterMs?: number;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (values: LoginInput) => Promise<AuthUser | null>;
  register: (values: RegisterInput) => Promise<AuthUser | null>;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoadingUser: boolean;
};
