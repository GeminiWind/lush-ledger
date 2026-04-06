import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/wallet", () => ({
  ensureDefaultWallet: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    account: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import { ensureDefaultWallet } from "@/lib/wallet";
import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/accounts/route";
import { PATCH, DELETE } from "@/app/api/accounts/[id]/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedEnsureDefaultWallet = vi.mocked(ensureDefaultWallet);

const accountFindMany = prisma.account.findMany as unknown as ReturnType<typeof vi.fn>;
const accountFindFirst = prisma.account.findFirst as unknown as ReturnType<typeof vi.fn>;
const accountCreate = prisma.account.create as unknown as ReturnType<typeof vi.fn>;
const accountUpdate = prisma.account.update as unknown as ReturnType<typeof vi.fn>;
const accountUpdateMany = prisma.account.updateMany as unknown as ReturnType<typeof vi.fn>;
const accountDelete = prisma.account.delete as unknown as ReturnType<typeof vi.fn>;
const txFindMany = prisma.transaction.findMany as unknown as ReturnType<typeof vi.fn>;
const txCount = prisma.transaction.count as unknown as ReturnType<typeof vi.fn>;
const prismaTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe("Wallet API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedEnsureDefaultWallet.mockResolvedValue(undefined as never);
    accountFindMany.mockResolvedValue([{ id: "w1", name: "Main Wallet", isDefault: true }]);
    accountFindFirst.mockResolvedValue({ id: "w1", userId: "u1", isDefault: false, openingBalance: 100, name: "Main" });
    accountCreate.mockResolvedValue({ id: "w2", name: "Cash" });
    accountUpdate.mockResolvedValue({ id: "w1", openingBalance: 80, name: "Main" });
    accountUpdateMany.mockResolvedValue({ count: 1 });
    accountDelete.mockResolvedValue({ id: "w1" });
    txFindMany.mockResolvedValue([{ type: "expense", amount: 20 }]);
    txCount.mockResolvedValue(0);
    prismaTransaction.mockImplementation(async (cb: (tx: typeof prisma) => unknown) => cb(prisma as never));
  });

  it("GET /api/accounts returns account list", async () => {
    const response = await GET(new NextRequest("http://localhost/api/accounts"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedEnsureDefaultWallet).toHaveBeenCalledWith("u1");
    expect(body.accounts).toEqual([{ id: "w1", name: "Main Wallet", isDefault: true }]);
  });

  it("POST /api/accounts validates type", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name: "Wallet", type: "invalid", openingBalance: 0 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid wallet type." });
  });

  it("POST /api/accounts creates wallet", async () => {
    accountFindFirst.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/accounts", {
        method: "POST",
        body: JSON.stringify({ name: "Cash", type: "cash", openingBalance: 50, setAsDefault: true }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(accountCreate).toHaveBeenCalled();
    expect(body.account).toEqual({ id: "w2", name: "Cash" });
  });

  it("PATCH /api/accounts/[id] validates balance mode", async () => {
    const response = await PATCH(
      new NextRequest("http://localhost/api/accounts/w1", {
        method: "PATCH",
        body: JSON.stringify({ balance: -1 }),
      }),
      { params: Promise.resolve({ id: "w1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("non-negative");
  });

  it("PATCH /api/accounts/[id] updates current balance", async () => {
    txFindMany.mockResolvedValue([{ type: "expense", amount: 20 }, { type: "income", amount: 40 }]);
    accountUpdate.mockResolvedValue({ id: "w1", openingBalance: 60 });

    const response = await PATCH(
      new NextRequest("http://localhost/api/accounts/w1", {
        method: "PATCH",
        body: JSON.stringify({ balance: 80 }),
      }),
      { params: Promise.resolve({ id: "w1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(accountUpdate).toHaveBeenCalled();
    expect(body.wallet).toEqual({ id: "w1", openingBalance: 60 });
  });

  it("PATCH /api/accounts/[id] updates wallet info", async () => {
    accountUpdate.mockResolvedValue({ id: "w1", name: "Main Updated", openingBalance: 100, isDefault: true });

    const response = await PATCH(
      new NextRequest("http://localhost/api/accounts/w1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Main Updated", openingBalance: 100, setAsDefault: true }),
      }),
      { params: Promise.resolve({ id: "w1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(accountUpdateMany).toHaveBeenCalled();
    expect(body.wallet.id).toBe("w1");
  });

  it("DELETE /api/accounts/[id] blocks deleting default wallet", async () => {
    accountFindFirst.mockResolvedValue({ id: "w1", isDefault: true });

    const response = await DELETE(new NextRequest("http://localhost/api/accounts/w1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "w1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Default wallet cannot be deleted");
  });

  it("DELETE /api/accounts/[id] blocks wallet with linked transactions", async () => {
    txCount.mockResolvedValue(2);

    const response = await DELETE(new NextRequest("http://localhost/api/accounts/w1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "w1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("cannot be deleted");
  });

  it("DELETE /api/accounts/[id] deletes wallet", async () => {
    const response = await DELETE(new NextRequest("http://localhost/api/accounts/w1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "w1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(accountDelete).toHaveBeenCalledWith({ where: { id: "w1" } });
    expect(body).toEqual({ ok: true });
  });
});
