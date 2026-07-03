export const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const actionButtonPattern = (action: string, name: string) => new RegExp(`${action}\\s+${escapeRegExp(name)}`);

export const buildUniqueEmail = () =>
  `e2e-register-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

export const REGISTER_PASSWORD = "Aa!12345";
