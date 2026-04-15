import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/date", () => ({
  nowDate: vi.fn(() => new Date("2026-04-06T00:00:00.000Z")),
  addMonthsDate: vi.fn(() => new Date("2026-05-01T00:00:00.000Z")),
}));

vi.mock("@/lib/monthly-cap", () => ({
  ensureMonthlyCapSnapshot: vi.fn(),
  monthStartOf: vi.fn((date: Date) => {
    const monthStart = new Date(date);
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    return monthStart;
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    categoryMonthlyLimit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    transaction: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import { prisma } from "@/lib/db";
import { addMonthsDate, nowDate } from "@/lib/date";
import { GET, POST } from "@/app/api/categories/route";
import { PATCH, DELETE } from "@/app/api/categories/[id]/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedSnapshot = vi.mocked(ensureMonthlyCapSnapshot);
const mockedNowDate = vi.mocked(nowDate);
const mockedAddMonthsDate = vi.mocked(addMonthsDate);
const categoryFindMany = prisma.category.findMany as unknown as ReturnType<typeof vi.fn>;
const categoryFindFirst = prisma.category.findFirst as unknown as ReturnType<typeof vi.fn>;
const categoryUpdate = prisma.category.update as unknown as ReturnType<typeof vi.fn>;
const categoryDelete = prisma.category.delete as unknown as ReturnType<typeof vi.fn>;
const limitFindMany = prisma.categoryMonthlyLimit.findMany as unknown as ReturnType<typeof vi.fn>;
const limitFindUnique = prisma.categoryMonthlyLimit.findUnique as unknown as ReturnType<typeof vi.fn>;
const limitCreate = prisma.categoryMonthlyLimit.create as unknown as ReturnType<typeof vi.fn>;
const limitUpsert = prisma.categoryMonthlyLimit.upsert as unknown as ReturnType<typeof vi.fn>;
const limitDeleteMany = prisma.categoryMonthlyLimit.deleteMany as unknown as ReturnType<typeof vi.fn>;
const txUpdateMany = prisma.transaction.updateMany as unknown as ReturnType<typeof vi.fn>;
const transactionMock = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe("Category API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedSnapshot.mockResolvedValue({ totalCap: 1000, totalLimit: 0 } as never);
    categoryFindMany.mockResolvedValue([{ id: "c1", name: "Food" }]);
    limitFindMany.mockResolvedValue([]);
    limitFindUnique.mockResolvedValue({ limit: 0 });
    categoryFindFirst.mockResolvedValue({ id: "c1" });
    categoryUpdate.mockResolvedValue({ id: "c1", name: "Dining" });
    categoryDelete.mockResolvedValue({ id: "c1" });
    limitCreate.mockResolvedValue({});
    limitUpsert.mockResolvedValue({});
    limitDeleteMany.mockResolvedValue({});
    txUpdateMany.mockResolvedValue({ count: 0 });
    transactionMock.mockImplementation(async (cb: (tx: typeof prisma) => unknown) => cb(prisma as never));
  });

  it("GET /api/categories returns categories", async () => {
    const response = await GET(new NextRequest("http://localhost/api/categories"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ categories: [{ id: "c1", name: "Food" }] });
  });

  it("POST /api/categories validates name", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "", monthlyLimit: 10 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Name is required.",
      errors: { name: "Name is required." },
    });
  });

  it("POST /api/categories validates non-negative monthlyLimit", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Food", monthlyLimit: -1, warnAt: 80 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Monthly limit must be zero or greater.",
      errors: { monthlyLimit: "Monthly limit must be zero or greater." },
    });
  });

  it("POST /api/categories validates warnAt range", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Food", monthlyLimit: 10, warnAt: 101 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Warn threshold must be between 1 and 100.",
      errors: { warnAt: "Warn threshold must be between 1 and 100." },
    });
  });

  it("POST /api/categories rejects duplicate name using normalized comparison", async () => {
    categoryFindMany.mockResolvedValueOnce([{ name: "  FOOD  " }]);

    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "food", monthlyLimit: 10, warnAt: 80 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Category name already exists.",
      errors: { name: "Category name already exists." },
    });
  });

  it("POST /api/categories checks monthly cap overflow", async () => {
    mockedSnapshot.mockResolvedValue({ totalCap: 100, totalLimit: 0 } as never);
    limitFindMany.mockResolvedValueOnce([{ limit: 90 }]).mockResolvedValueOnce([]);

    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Groceries", monthlyLimit: 20, warnAt: 80 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Category limits exceed monthly cap");
  });

  it("POST /api/categories creates category and month limits", async () => {
    (prisma.category.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "c2", name: "Travel" });

    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Travel", monthlyLimit: 100, warnAt: 80 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(limitCreate).toHaveBeenCalled();
    expect(limitUpsert).toHaveBeenCalled();
    expect(limitCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categoryId: "c2",
          limit: 100,
        }),
      }),
    );
    expect(limitUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          categoryId: "c2",
          limit: 100,
        }),
        update: expect.objectContaining({
          limit: 100,
        }),
      }),
    );
    expect(body.category).toEqual({ id: "c2", name: "Travel" });
  });

  it("POST /api/categories writes current and next month snapshots from calendar now", async () => {
    const currentMonth = new Date("2026-04-01T00:00:00.000Z");
    const nextMonth = new Date("2026-05-01T00:00:00.000Z");

    mockedNowDate.mockReturnValueOnce(new Date("2026-04-14T12:00:00.000Z") as never);
    mockedAddMonthsDate.mockReturnValueOnce(nextMonth as never);
    (prisma.category.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "c3", name: "Utilities" });

    const response = await POST(
      new NextRequest("http://localhost/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: "Utilities", monthlyLimit: 200, warnAt: 80 }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockedSnapshot).toHaveBeenCalledWith("u1", currentMonth);
    expect(mockedSnapshot).toHaveBeenCalledWith("u1", nextMonth);
    expect(limitCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monthStart: currentMonth }),
      }),
    );
    expect(limitUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_categoryId_monthStart: expect.objectContaining({ monthStart: nextMonth }),
        }),
      }),
    );
  });

  it("PATCH /api/categories/[id] returns 404 when category does not exist", async () => {
    categoryFindFirst.mockResolvedValue(null);

    const response = await PATCH(
      new NextRequest("http://localhost/api/categories/c-missing", {
        method: "PATCH",
        body: JSON.stringify({ name: "X", monthlyLimit: 10, warnAt: 80 }),
      }),
      { params: Promise.resolve({ id: "c-missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Category not found." });
  });

  it("PATCH /api/categories/[id] updates category and limits", async () => {
    const response = await PATCH(
      new NextRequest("http://localhost/api/categories/c1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Dining", monthlyLimit: 120, warnAt: 80 }),
      }),
      { params: Promise.resolve({ id: "c1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(categoryUpdate).toHaveBeenCalled();
    expect(limitUpsert).toHaveBeenCalled();
    expect(body.category).toEqual({ id: "c1", name: "Dining" });
  });

  it("DELETE /api/categories/[id] returns 404 when category missing", async () => {
    categoryFindFirst.mockResolvedValue(null);

    const response = await DELETE(new NextRequest("http://localhost/api/categories/missing", { method: "DELETE" }), {
      params: Promise.resolve({ id: "missing" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Category not found." });
  });

  it("DELETE /api/categories/[id] unlinks tx and deletes category", async () => {
    const response = await DELETE(new NextRequest("http://localhost/api/categories/c1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "c1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(txUpdateMany).toHaveBeenCalled();
    expect(limitDeleteMany).toHaveBeenCalled();
    expect(categoryDelete).toHaveBeenCalled();
    expect(body).toEqual({ ok: true });
  });
});
