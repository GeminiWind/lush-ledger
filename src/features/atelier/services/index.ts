import type { AtelierJsonRecord } from "@/features/atelier/types";

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

  return (await response.json()) as AtelierJsonRecord;
};

export const createCategory = (payload: AtelierJsonRecord) => {
  return request("/api/categories", { method: "POST", body: JSON.stringify(payload) }, "Could not create category.");
};

export const updateCategory = (id: string, payload: AtelierJsonRecord) => {
  return request(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, "Could not update category.");
};

export const deleteCategory = (id: string) => {
  return request(`/api/categories/${id}`, { method: "DELETE" }, "Could not delete category.");
};

export const updateMonthlyCap = (payload: AtelierJsonRecord) => {
  return request("/api/atelier/cap", { method: "PATCH", body: JSON.stringify(payload) }, "Could not update monthly cap.");
};
