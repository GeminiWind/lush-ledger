import type { SavingsJsonRecord } from "@/features/savings/types";

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

  return (await response.json()) as SavingsJsonRecord;
};

export const createSavingsPlan = (payload: SavingsJsonRecord) => {
  return request("/api/savings/plans", { method: "POST", body: JSON.stringify(payload) }, "Could not create savings plan.");
};

export const updateSavingsPlan = (id: string, payload: SavingsJsonRecord) => {
  return request(`/api/savings/plans/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, "Could not update savings plan.");
};

export const addSavingsContribution = (payload: SavingsJsonRecord) => {
  return request("/api/ledger", { method: "POST", body: JSON.stringify(payload) }, "Could not add contribution.");
};
