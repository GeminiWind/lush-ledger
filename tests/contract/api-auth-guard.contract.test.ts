import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

import { getSessionFromRequest } from "@/lib/auth";
import * as accountsRoute from "@/app/api/accounts/route";
import * as accountsIdRoute from "@/app/api/accounts/[id]/route";
import * as categoriesRoute from "@/app/api/categories/route";
import * as categoriesIdRoute from "@/app/api/categories/[id]/route";
import * as ledgerRoute from "@/app/api/ledger/route";
import * as ledgerIdRoute from "@/app/api/ledger/[id]/route";
import * as atelierRoute from "@/app/api/atelier/route";
import * as atelierCapRoute from "@/app/api/atelier/cap/route";
import * as settingsRoute from "@/app/api/settings/route";
import * as savingsPlansRoute from "@/app/api/savings/plans/route";
import * as savingsPlanIdRoute from "@/app/api/savings/plans/[id]/route";

const mockedSession = vi.mocked(getSessionFromRequest);

const req = (method: string, path: string) =>
  new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify({}),
  });

describe("API auth guard contract", () => {
  beforeEach(() => {
    mockedSession.mockResolvedValue(null);
  });

  it.each([
    ["GET /api/accounts", () => accountsRoute.GET(req("GET", "/api/accounts"))],
    ["POST /api/accounts", () => accountsRoute.POST(req("POST", "/api/accounts"))],
    ["PATCH /api/accounts/[id]", () => accountsIdRoute.PATCH(req("PATCH", "/api/accounts/a1"), { params: Promise.resolve({ id: "a1" }) })],
    ["DELETE /api/accounts/[id]", () => accountsIdRoute.DELETE(req("DELETE", "/api/accounts/a1"), { params: Promise.resolve({ id: "a1" }) })],
    ["GET /api/categories", () => categoriesRoute.GET(req("GET", "/api/categories"))],
    ["POST /api/categories", () => categoriesRoute.POST(req("POST", "/api/categories"))],
    ["PATCH /api/categories/[id]", () => categoriesIdRoute.PATCH(req("PATCH", "/api/categories/c1"), { params: Promise.resolve({ id: "c1" }) })],
    ["DELETE /api/categories/[id]", () => categoriesIdRoute.DELETE(req("DELETE", "/api/categories/c1"), { params: Promise.resolve({ id: "c1" }) })],
    ["GET /api/ledger", () => ledgerRoute.GET(req("GET", "/api/ledger"))],
    ["POST /api/ledger", () => ledgerRoute.POST(req("POST", "/api/ledger"))],
    ["PATCH /api/ledger/[id]", () => ledgerIdRoute.PATCH(req("PATCH", "/api/ledger/l1"), { params: Promise.resolve({ id: "l1" }) })],
    ["DELETE /api/ledger/[id]", () => ledgerIdRoute.DELETE(req("DELETE", "/api/ledger/l1"), { params: Promise.resolve({ id: "l1" }) })],
    ["GET /api/atelier", () => atelierRoute.GET(req("GET", "/api/atelier"))],
    ["PATCH /api/atelier/cap", () => atelierCapRoute.PATCH(req("PATCH", "/api/atelier/cap"))],
    ["GET /api/settings", () => settingsRoute.GET(req("GET", "/api/settings"))],
    ["PATCH /api/settings", () => settingsRoute.PATCH(req("PATCH", "/api/settings"))],
    ["POST /api/savings/plans", () => savingsPlansRoute.POST(req("POST", "/api/savings/plans"))],
    ["PATCH /api/savings/plans/[id]", () => savingsPlanIdRoute.PATCH(req("PATCH", "/api/savings/plans/s1"), { params: Promise.resolve({ id: "s1" }) })],
  ])("returns 401 for unauthenticated request: %s", async (_, call) => {
    const response = await call();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Unauthorized" });
  });
});
