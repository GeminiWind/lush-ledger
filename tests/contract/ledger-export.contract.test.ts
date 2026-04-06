import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/ledger/export/route";
import { getSessionFromRequest } from "@/lib/auth";
import {
  buildLedgerExportFileName,
  getLedgerExportRows,
  LedgerExportValidationError,
  parseLedgerExportQuery,
  serializeLedgerExportCsv,
} from "@/lib/ledger-export";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/ledger-export", () => {
  class TestLedgerExportValidationError extends Error {}

  return {
    LedgerExportValidationError: TestLedgerExportValidationError,
    parseLedgerExportQuery: vi.fn(),
    getLedgerExportRows: vi.fn(),
    serializeLedgerExportCsv: vi.fn(),
    buildLedgerExportFileName: vi.fn(),
  };
});

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedParse = vi.mocked(parseLedgerExportQuery);
const mockedGetRows = vi.mocked(getLedgerExportRows);
const mockedSerialize = vi.mocked(serializeLedgerExportCsv);
const mockedFileName = vi.mocked(buildLedgerExportFileName);

describe("GET /api/ledger/export contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "user-1", email: "user@example.com" });
    mockedParse.mockReturnValue({});
    mockedGetRows.mockResolvedValue([]);
    mockedSerialize.mockReturnValue("transaction_date,account,category,transaction_type,description,amount,currency");
    mockedFileName.mockReturnValue("ledger-transactions-2026-04-06.csv");
  });

  it("returns 401 without authenticated session", async () => {
    mockedSession.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/ledger/export"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when filters are invalid", async () => {
    mockedParse.mockImplementation(() => {
      throw new LedgerExportValidationError("Start date must be before or equal to end date.");
    });

    const response = await GET(new NextRequest("http://localhost/api/ledger/export?startDate=2026-04-06&endDate=2026-04-01"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Start date must be before or equal to end date." });
  });

  it("returns CSV response with expected headers for authenticated requests", async () => {
    mockedParse.mockReturnValue({ query: "coffee", type: "expense" });
    mockedGetRows.mockResolvedValue([
      {
        transactionDate: "2026-04-06",
        account: "Main Wallet",
        category: "Dining",
        transactionType: "expense",
        description: "Morning coffee",
        amount: "45000",
        currency: "VND",
      },
    ]);
    mockedSerialize.mockReturnValue(
      "transaction_date,account,category,transaction_type,description,amount,currency\n2026-04-06,Main Wallet,Dining,expense,Morning coffee,45000,VND",
    );

    const response = await GET(new NextRequest("http://localhost/api/ledger/export?query=coffee&type=expense"));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toContain("attachment;");
    expect(response.headers.get("content-disposition")).toContain("filename=");
    expect(text).toContain("transaction_date,account,category,transaction_type,description,amount,currency");
    expect(text).toContain("Morning coffee");
    expect(mockedParse).toHaveBeenCalled();
    expect(mockedGetRows).toHaveBeenCalledWith("user-1", { query: "coffee", type: "expense" });
  });

  it("returns 500 when CSV generation fails", async () => {
    mockedGetRows.mockRejectedValue(new Error("db failure"));

    const response = await GET(new NextRequest("http://localhost/api/ledger/export"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "Could not export transactions. Please try again." });
  });
});
