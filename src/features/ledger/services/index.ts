import type { LedgerExportDownload, LedgerExportFilters, LedgerJsonRecord } from "@/features/ledger/types";

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

const toExportSearchParams = (filters: LedgerExportFilters) => {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }
  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.accountId?.trim()) {
    params.set("accountId", filters.accountId.trim());
  }
  if (filters.categoryId?.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }
  if (filters.startDate?.trim()) {
    params.set("startDate", filters.startDate.trim());
  }
  if (filters.endDate?.trim()) {
    params.set("endDate", filters.endDate.trim());
  }

  return params;
};

const toFileName = (contentDisposition: string | null) => {
  if (!contentDisposition) {
    return "ledger-transactions.csv";
  }

  const directMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }

  return "ledger-transactions.csv";
};

export const exportTransactionsCsv = async (filters: LedgerExportFilters = {}): Promise<LedgerExportDownload> => {
  const searchParams = toExportSearchParams(filters);
  const queryString = searchParams.toString();
  const input = queryString ? `/api/ledger/export?${queryString}` : "/api/ledger/export";

  const response = await fetch(input, { method: "GET" });

  if (!response.ok) {
    throw new Error(await extractError(response, "Could not export transactions. Please try again."));
  }

  return {
    fileName: toFileName(response.headers.get("content-disposition")),
    blob: await response.blob(),
    contentType: response.headers.get("content-type"),
  };
};
