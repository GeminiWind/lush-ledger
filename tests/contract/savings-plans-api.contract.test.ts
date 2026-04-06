import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/date", () => ({
  nowDate: vi.fn(() => new Date("2026-04-06T00:00:00.000Z")),
  startOfMonthDate: vi.fn(() => new Date("2026-04-01T00:00:00.000Z")),
  fromISODate: vi.fn((value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    savingsPlan: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { POST } from "@/app/api/savings/plans/route";
import { PATCH } from "@/app/api/savings/plans/[id]/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const planFindFirst = prisma.savingsPlan.findFirst as unknown as ReturnType<typeof vi.fn>;
const planUpdateMany = prisma.savingsPlan.updateMany as unknown as ReturnType<typeof vi.fn>;
const planCreate = prisma.savingsPlan.create as unknown as ReturnType<typeof vi.fn>;
const planUpdate = prisma.savingsPlan.update as unknown as ReturnType<typeof vi.fn>;
const txFindMany = prisma.transaction.findMany as unknown as ReturnType<typeof vi.fn>;
const txCreate = prisma.transaction.create as unknown as ReturnType<typeof vi.fn>;
const accountFindFirst = prisma.account.findFirst as unknown as ReturnType<typeof vi.fn>;
const accountCreate = prisma.account.create as unknown as ReturnType<typeof vi.fn>;
const prismaTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe("Savings plans API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    planFindFirst.mockResolvedValue({ id: "p1", status: "active", isPrimary: true, name: "Goal" });
    planUpdateMany.mockResolvedValue({ count: 1 });
    planCreate.mockResolvedValue({ id: "p2", name: "Vacation" });
    planUpdate.mockResolvedValue({ id: "p1", name: "Goal Updated", status: "active" });
    txFindMany.mockResolvedValue([{ amount: 50, type: "income" }]);
    txCreate.mockResolvedValue({ id: "t-refund" });
    accountFindFirst.mockResolvedValue({ id: "a1" });
    accountCreate.mockResolvedValue({ id: "a-new" });
    prismaTransaction.mockImplementation(async (cb: (tx: typeof prisma) => unknown) => cb(prisma as never));
  });

  it("POST /api/savings/plans validates target amount", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/plans", {
        method: "POST",
        body: JSON.stringify({ name: "Goal", targetAmount: 0, monthlyContribution: 10, targetDate: "2026-05-01" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Savings target must be greater than zero." });
  });

  it("POST /api/savings/plans validates target date range", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/plans", {
        method: "POST",
        body: JSON.stringify({ name: "Goal", targetAmount: 100, monthlyContribution: 10, targetDate: "2026-03-01" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Target date must be this month or later." });
  });

  it("POST /api/savings/plans creates new plan", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/plans", {
        method: "POST",
        body: JSON.stringify({
          name: "Vacation",
          targetAmount: 1000,
          monthlyContribution: 200,
          targetDate: "2026-06-01",
          isPrimary: true,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(planUpdateMany).toHaveBeenCalled();
    expect(planCreate).toHaveBeenCalled();
    expect(body.plan).toEqual({ id: "p2", name: "Vacation" });
  });

  it("PATCH /api/savings/plans/[id] returns 404 when plan not found", async () => {
    planFindFirst.mockResolvedValue(null);

    const response = await PATCH(
      new NextRequest("http://localhost/api/savings/plans/missing", {
        method: "PATCH",
        body: JSON.stringify({ name: "Changed" }),
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Savings plan not found." });
  });

  it("PATCH /api/savings/plans/[id] returns 400 for no changes", async () => {
    const response = await PATCH(
      new NextRequest("http://localhost/api/savings/plans/p1", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "p1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "No changes provided." });
  });

  it("PATCH /api/savings/plans/[id] validates target amount against current saved", async () => {
    txFindMany.mockResolvedValue([{ amount: 400, type: "income" }]);

    const response = await PATCH(
      new NextRequest("http://localhost/api/savings/plans/p1", {
        method: "PATCH",
        body: JSON.stringify({ targetAmount: 100 }),
      }),
      { params: Promise.resolve({ id: "p1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("greater than or equal to current saved amount");
  });

  it("PATCH /api/savings/plans/[id] updates plan", async () => {
    const response = await PATCH(
      new NextRequest("http://localhost/api/savings/plans/p1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Goal Updated", monthlyContribution: 300 }),
      }),
      { params: Promise.resolve({ id: "p1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(planUpdate).toHaveBeenCalled();
    expect(body.plan).toEqual({ id: "p1", name: "Goal Updated", status: "active" });
  });
});
