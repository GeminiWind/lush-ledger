import { afterEach, describe, expect, it, vi } from "vitest";
import { exportTransactionsCsv } from "@/features/ledger/services";
import {
  parseLedgerExportQuery,
  LedgerExportValidationError,
  serializeLedgerExportCsv,
} from "@/lib/ledger-export";

describe("ledger export integration behavior", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps header-only CSV when there are no rows", () => {
    const csv = serializeLedgerExportCsv([]);

    expect(csv).toBe("transaction_date,account,category,transaction_type,description,amount,currency");
  });

  it("escapes commas, quotes, and line breaks in CSV values", () => {
    const csv = serializeLedgerExportCsv([
      {
        transactionDate: "2026-04-06",
        account: "Main, Wallet",
        category: "Dining",
        transactionType: "expense",
        description: "He said \"hello\"\nand left",
        amount: "45000",
        currency: "VND",
      },
    ]);

    expect(csv).toContain('"Main, Wallet"');
    expect(csv).toContain('"He said ""hello""\nand left"');
  });

  it("rejects invalid date range (start after end)", () => {
    expect(() =>
      parseLedgerExportQuery(
        new URLSearchParams({ startDate: "2026-05-01", endDate: "2026-04-01" }),
      ),
    ).toThrow(LedgerExportValidationError);
  });

  it("builds filtered export request and reads downloadable filename", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("a,b\n1,2", {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": "attachment; filename=\"ledger-export.csv\"",
        },
      }),
    );

    const result = await exportTransactionsCsv({
      query: "coffee",
      type: "expense",
      accountId: "acc-1",
      categoryId: "cat-1",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ledger/export?query=coffee&type=expense&accountId=acc-1&categoryId=cat-1&startDate=2026-04-01&endDate=2026-04-30",
      { method: "GET" },
    );
    expect(result.fileName).toBe("ledger-export.csv");
    expect(result.contentType).toBe("text/csv; charset=utf-8");
    expect(result.blob.size).toBeGreaterThan(0);
  });

  it("throws retry-friendly message when export fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Could not export transactions. Please try again." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(exportTransactionsCsv()).rejects.toThrow("Could not export transactions. Please try again.");
  });
});
