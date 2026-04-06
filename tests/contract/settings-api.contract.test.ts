import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GET, PATCH } from "@/app/api/settings/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const userFindUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const userUpdate = prisma.user.update as unknown as ReturnType<typeof vi.fn>;

describe("Settings API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
  });

  it("GET /api/settings returns mapped settings payload", async () => {
    userFindUnique.mockResolvedValue({
      name: "User One",
      email: "u1@example.com",
      settings: { currency: "USD", language: "en-US", theme: "dark" },
    });

    const response = await GET(new NextRequest("http://localhost/api/settings"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.settings).toEqual({
      name: "User One",
      email: "u1@example.com",
      currency: "USD",
      language: "en-US",
      theme: "dark",
    });
  });

  it("GET /api/settings returns 404 when user not found", async () => {
    userFindUnique.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/settings"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "User not found." });
  });

  it("PATCH /api/settings validates name", async () => {
    const request = new NextRequest("http://localhost/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ name: "A", currency: "VND", language: "vi-VN", theme: "light" }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Name must be at least 2 characters." });
  });

  it("PATCH /api/settings validates currency", async () => {
    const request = new NextRequest("http://localhost/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ name: "User", currency: "XYZ", language: "vi-VN", theme: "light" }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid currency." });
  });

  it("PATCH /api/settings updates profile and settings", async () => {
    userUpdate.mockResolvedValue({ id: "u1" });
    const request = new NextRequest("http://localhost/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ name: "User", currency: "usd", language: "en-US", theme: "system" }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(userUpdate).toHaveBeenCalled();
  });
});
