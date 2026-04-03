type DecimalLike = {
  toNumber: () => number;
  d?: unknown;
  e?: unknown;
  s?: unknown;
  constructor?: { name?: string };
};

const isDecimalLike = (value: unknown): value is DecimalLike => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as DecimalLike;
  if (typeof candidate.toNumber !== "function") {
    return false;
  }

  if ("d" in candidate && "e" in candidate && "s" in candidate) {
    return true;
  }

  return candidate.constructor?.name === "Decimal";
};

export const serializeForClient = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => serializeForClient(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (isDecimalLike(value)) {
    return value.toNumber() as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return Object.fromEntries(entries.map(([key, item]) => [key, serializeForClient(item)])) as T;
  }

  return value;
};
