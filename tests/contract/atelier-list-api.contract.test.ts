import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/atelier", () => ({
  getAtelierListData: vi.fn(),
}));

import { GET } from "@/app/api/atelier/route";
import { getSessionFromRequest } from "@/lib/auth";
import { getAtelierListData } from "@/lib/atelier";
import {
  buildAtelierListContractSuccess,
  buildAtelierListMonthValidationError,
  buildAtelierListUnauthorizedError,
} from "../fixtures/atelier-list-fixtures";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedGetAtelierListData = vi.mocked(getAtelierListData);

describe("Atelier list API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedGetAtelierListData.mockResolvedValue(buildAtelierListContractSuccess());
  });

  it("returns 401 structured auth error when request is unauthorized", async () => {
    mockedSession.mockResolvedValueOnce(null);

    const response = await GET(new NextRequest("http://localhost/api/atelier"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual(buildAtelierListUnauthorizedError());
  });

  it("returns 400 structured month validation error for invalid month", async () => {
    const response = await GET(new NextRequest("http://localhost/api/atelier?month=2026-4"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual(buildAtelierListMonthValidationError());
    expect(mockedGetAtelierListData).not.toHaveBeenCalled();
  });

  it("returns month-scoped atelier list response shape", async () => {
    const payload = buildAtelierListContractSuccess({ month: "2026-04" });
    mockedGetAtelierListData.mockResolvedValueOnce(payload);

    const response = await GET(new NextRequest("http://localhost/api/atelier?month=2026-04"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
    expect(mockedGetAtelierListData).toHaveBeenCalledWith("u1", { month: "2026-04" });
  });

  it("preserves per-category warning thresholds from backend rows", async () => {
    const payload = buildAtelierListContractSuccess({
      month: "2026-04",
      categories: [
        {
          id: "cat_food",
          name: "Food",
          icon: "restaurant",
          limit: 500,
          spent: 320,
          usagePercent: 64,
          warningEnabled: true,
          warnAt: 70,
          carryNextMonth: true,
          status: "healthy",
        },
        {
          id: "cat_transport",
          name: "Transport",
          icon: "directions_car",
          limit: 400,
          spent: 300,
          usagePercent: 75,
          warningEnabled: true,
          warnAt: 90,
          carryNextMonth: false,
          status: "healthy",
        },
      ],
    });
    mockedGetAtelierListData.mockResolvedValueOnce(payload);

    const response = await GET(new NextRequest("http://localhost/api/atelier?month=2026-04"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toHaveLength(2);
    expect(body.categories[0]).toMatchObject({ id: "cat_food", warnAt: 70, warningEnabled: true });
    expect(body.categories[1]).toMatchObject({ id: "cat_transport", warnAt: 90, warningEnabled: true });
    expect(mockedGetAtelierListData).toHaveBeenCalledWith("u1", { month: "2026-04" });
  });

  it("uses current month when query month is omitted", async () => {
    const response = await GET(new NextRequest("http://localhost/api/atelier"));

    expect(response.status).toBe(200);
    expect(mockedGetAtelierListData).toHaveBeenCalledWith("u1", { month: null });
  });
});
