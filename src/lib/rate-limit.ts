import { NextRequest } from "next/server";
import { DateTime } from "luxon";

type BackoffEntry = {
  failures: number;
  blockedUntil: number;
  updatedAt: number;
};

const authBackoffStore = new Map<string, BackoffEntry>();

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 5 * 60 * 1000;
const ENTRY_TTL_MS = 30 * 60 * 1000;

const nowMs = () => DateTime.now().toMillis();

const normalizedIp = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
};

const cleanupExpiredEntries = () => {
  const now = nowMs();
  for (const [key, entry] of authBackoffStore.entries()) {
    if (now - entry.updatedAt > ENTRY_TTL_MS) {
      authBackoffStore.delete(key);
    }
  }
};

export const getAuthBackoffKey = (
  request: NextRequest,
  scope: "login" | "register",
  identity?: string,
) => {
  const ip = normalizedIp(request);
  const normalizedIdentity = (identity || "unknown").trim().toLowerCase();
  return `${scope}:${ip}:${normalizedIdentity}`;
};

export const getRemainingBackoffMs = (key: string) => {
  cleanupExpiredEntries();

  const entry = authBackoffStore.get(key);
  if (!entry) {
    return 0;
  }

  const remaining = entry.blockedUntil - nowMs();
  return remaining > 0 ? remaining : 0;
};

export const registerBackoffFailure = (key: string) => {
  cleanupExpiredEntries();

  const now = nowMs();
  const previous = authBackoffStore.get(key);
  const failures = (previous?.failures || 0) + 1;
  const delayMs = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.max(0, failures - 1));
  const blockedUntil = now + delayMs;

  authBackoffStore.set(key, {
    failures,
    blockedUntil,
    updatedAt: now,
  });

  return delayMs;
};

export const clearBackoff = (key: string) => {
  authBackoffStore.delete(key);
};
