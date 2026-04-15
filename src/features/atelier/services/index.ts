import type { AtelierJsonRecord } from "@/features/atelier/types";

type FieldErrors = Record<string, string>;

export type CreateCategorySuccess = {
  category: {
    id: string;
    userId: string;
    name: string;
    icon: string;
  };
};

export type CreateCategoryError = {
  message: string;
  fieldErrors: FieldErrors;
  status: number;
};

const normalizeFieldErrors = (errors: unknown): FieldErrors => {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.entries(errors as Record<string, unknown>).reduce<FieldErrors>((acc, [key, value]) => {
    if (typeof value === "string" && value.trim()) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const parseCreateCategoryError = async (
  response: Response,
  fallbackMessage: string,
): Promise<CreateCategoryError> => {
  let payload: { error?: unknown; errors?: unknown } = {};

  try {
    payload = (await response.json()) as { error?: unknown; errors?: unknown };
  } catch {
    payload = {};
  }

  const fieldErrors = normalizeFieldErrors(payload.errors);
  const firstFieldMessage = Object.values(fieldErrors)[0];
  const message =
    (typeof payload.error === "string" && payload.error) ||
    firstFieldMessage ||
    fallbackMessage;

  return {
    message,
    fieldErrors,
    status: response.status,
  };
};

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

export const createCategoryWithParsedError = async (
  payload: AtelierJsonRecord,
  fallbackMessage: string,
): Promise<CreateCategorySuccess> => {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseCreateCategoryError(response, fallbackMessage);
  }

  return (await response.json()) as CreateCategorySuccess;
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
