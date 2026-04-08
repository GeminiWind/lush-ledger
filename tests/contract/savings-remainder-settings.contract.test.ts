import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/savings-remainder-allocation", () => ({
  getSavingsRemainderPrioritySettings: vi.fn(),
  replaceSavingsRemainderPrioritySettings: vi.fn(),
  addDefaultPrimarySavingsRemainderSetting: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    savingsPlan: {
      findMany: vi.fn(),
    },
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import {
  addDefaultPrimarySavingsRemainderSetting,
  getSavingsRemainderPrioritySettings,
  replaceSavingsRemainderPrioritySettings,
} from "@/lib/savings-remainder-allocation";
import { prisma } from "@/lib/db";
import { GET, POST, PUT } from "@/app/api/savings/remainder-allocation/settings/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedGetSettings = vi.mocked(getSavingsRemainderPrioritySettings);
const mockedReplaceSettings = vi.mocked(replaceSavingsRemainderPrioritySettings);
const mockedAddDefault = vi.mocked(addDefaultPrimarySavingsRemainderSetting);
const mockedFindMany = vi.mocked(prisma.savingsPlan.findMany);

describe("savings remainder settings contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedGetSettings.mockResolvedValue([{ savingsPlanId: "p1", priorityPercent: 100 }]);
    mockedReplaceSettings.mockResolvedValue([{ savingsPlanId: "p1", priorityPercent: 100 }]);
    mockedAddDefault.mockResolvedValue([{ savingsPlanId: "p1", priorityPercent: 100 }]);
    mockedFindMany.mockResolvedValue([
      {
        id: "p1",
        name: "Plan",
        userId: "u1",
        icon: "savings",
        status: "active",
        isPrimary: true,
        targetAmount: 1000,
        monthlyContribution: 100,
        targetDate: new Date("2026-12-01"),
        createdAt: new Date("2026-01-01"),
      },
    ] as never);
  });

  it("returns 401 without session", async () => {
    mockedSession.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/savings/remainder-allocation/settings"));
    expect(response.status).toBe(401);
  });

  it("returns settings list for GET", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/savings/remainder-allocation/settings?month=2026-04"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.settings).toEqual([{ savingsPlanId: "p1", priorityPercent: 100 }]);
    expect(mockedGetSettings).toHaveBeenCalled();
  });

  it("validates duplicate plan settings on PUT", async () => {
    const response = await PUT(
      new NextRequest("http://localhost/api/savings/remainder-allocation/settings", {
        method: "PUT",
        body: JSON.stringify({
          month: "2026-04",
          settings: [
            { savingsPlanId: "p1", priorityPercent: 60 },
            { savingsPlanId: "p1", priorityPercent: 40 },
          ],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("duplicate");
  });

  it("adds default primary setting on POST", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/remainder-allocation/settings", {
        method: "POST",
        body: JSON.stringify({ month: "2026-04" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.settings).toEqual([{ savingsPlanId: "p1", priorityPercent: 100 }]);
    expect(mockedAddDefault).toHaveBeenCalled();
  });
});
