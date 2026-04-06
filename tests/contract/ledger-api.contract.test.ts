import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/date", () => ({
  fromISODate: vi.fn((value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }),
  dayOfMonth: vi.fn(() => 6),
  toISODate: vi.fn(() => "2026-04-06"),
}));

vi.mock("@/lib/ledger", () => ({
  getLedgerData: vi.fn(),
}));

vi.mock("@/lib/wallet", () => ({
  ensureDefaultWallet: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    account: { findFirst: vi.fn() },
    category: { findFirst: vi.fn() },
    savingsPlan: { findFirst: vi.fn() },
    transaction: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import { getLedgerData } from "@/lib/ledger";
import { ensureDefaultWallet } from "@/lib/wallet";
import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/ledger/route";
import { PATCH, DELETE } from "@/app/api/ledger/[id]/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedGetLedgerData = vi.mocked(getLedgerData);
const mockedEnsureDefaultWallet = vi.mocked(ensureDefaultWallet);
const accountFindFirst = prisma.account.findFirst as unknown as ReturnType<typeof vi.fn>;
const categoryFindFirst = prisma.category.findFirst as unknown as ReturnType<typeof vi.fn>;
const savingsPlanFindFirst = prisma.savingsPlan.findFirst as unknown as ReturnType<typeof vi.fn>;
const txCreate = prisma.transaction.create as unknown as ReturnType<typeof vi.fn>;
const txFindFirst = prisma.transaction.findFirst as unknown as ReturnType<typeof vi.fn>;
const txUpdate = prisma.transaction.update as unknown as ReturnType<typeof vi.fn>;
const txDelete = prisma.transaction.delete as unknown as ReturnType<typeof vi.fn>;

describe("Ledger API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedGetLedgerData.mockResolvedValue({ transactions: [] } as never);
    mockedEnsureDefaultWallet.mockResolvedValue({ id: "w-default" } as never);
    accountFindFirst.mockResolvedValue({ id: "w1" });
    categoryFindFirst.mockResolvedValue({ id: "c1" });
    savingsPlanFindFirst.mockResolvedValue({ id: "s1" });
    txCreate.mockResolvedValue({ id: "t1" });
    txFindFirst.mockResolvedValue({ id: "t1" });
    txUpdate.mockResolvedValue({ id: "t1", amount: 20 });
    txDelete.mockResolvedValue({ id: "t1" });
  });

  it("GET /api/ledger forwards filters to domain service", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/ledger?query=coffee&type=expense&accountId=w1&categoryId=c1&startDate=2026-04-01&endDate=2026-04-06",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedGetLedgerData).toHaveBeenCalledWith("u1", {
      query: "coffee",
      type: "expense",
      accountId: "w1",
      categoryId: "c1",
      startDate: "2026-04-01",
      endDate: "2026-04-06",
    });
    expect(body).toEqual({ ledger: { transactions: [] } });
  });

  it("POST /api/ledger validates amount and date", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/ledger", {
        method: "POST",
        body: JSON.stringify({ amount: 0, date: "bad-date" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Amount and valid date are required");
  });

  it("POST /api/ledger rejects invalid category", async () => {
    categoryFindFirst.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/ledger", {
        method: "POST",
        body: JSON.stringify({ amount: 100, date: "2026-04-06", categoryId: "bad" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid category." });
  });

  it("POST /api/ledger rejects savingsPlanId for non-transfer type", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/ledger", {
        method: "POST",
        body: JSON.stringify({ amount: 100, date: "2026-04-06", type: "income", savingsPlanId: "s1" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Savings plan contributions must use type transfer_to_saving_plan");
  });

  it("POST /api/ledger creates transaction and returns 201", async () => {
    accountFindFirst.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/ledger", {
        method: "POST",
        body: JSON.stringify({ amount: 100, date: "2026-04-06", notes: "Coffee" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockedEnsureDefaultWallet).toHaveBeenCalledWith("u1");
    expect(txCreate).toHaveBeenCalled();
    expect(body).toEqual({ transaction: { id: "t1" } });
  });

  it("PATCH /api/ledger/[id] returns 404 when transaction missing", async () => {
    txFindFirst.mockResolvedValue(null);

    const response = await PATCH(
      new NextRequest("http://localhost/api/ledger/t404", {
        method: "PATCH",
        body: JSON.stringify({ amount: 10, date: "2026-04-06" }),
      }),
      { params: Promise.resolve({ id: "t404" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Transaction not found." });
  });

  it("PATCH /api/ledger/[id] updates transaction", async () => {
    const response = await PATCH(
      new NextRequest("http://localhost/api/ledger/t1", {
        method: "PATCH",
        body: JSON.stringify({ amount: 20, date: "2026-04-06", notes: "Updated" }),
      }),
      { params: Promise.resolve({ id: "t1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(txUpdate).toHaveBeenCalled();
    expect(body).toEqual({ transaction: { id: "t1", amount: 20 } });
  });

  it("DELETE /api/ledger/[id] deletes transaction", async () => {
    const response = await DELETE(new NextRequest("http://localhost/api/ledger/t1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "t1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(txDelete).toHaveBeenCalledWith({ where: { id: "t1" } });
    expect(body).toEqual({ ok: true });
  });
});
