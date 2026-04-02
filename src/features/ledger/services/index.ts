import type { LedgerJsonRecord } from "@/features/ledger/types";

const extractError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
};

const request = async (input: string, init: RequestInit, fallback: string) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await extractError(response, fallback));
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as LedgerJsonRecord;
};

export const createLedgerEntry = (payload: LedgerJsonRecord) => {
  return request("/api/ledger", { method: "POST", body: JSON.stringify(payload) }, "Could not create entry.");
};

export const updateLedgerEntry = (id: string, payload: LedgerJsonRecord) => {
  return request(`/api/ledger/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, "Could not update entry.");
};

export const deleteLedgerEntry = (id: string) => {
  return request(`/api/ledger/${id}`, { method: "DELETE" }, "Could not delete entry.");
};
