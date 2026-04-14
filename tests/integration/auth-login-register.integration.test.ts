import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hash"),
  signToken: vi.fn().mockResolvedValue("token"),
  setSessionCookie: vi.fn().mockResolvedValue(undefined),
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  getAuthBackoffKey: vi.fn().mockReturnValue("bk"),
  getRemainingBackoffMs: vi.fn().mockReturnValue(0),
  registerBackoffFailure: vi.fn().mockReturnValue(1200),
  clearBackoff: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { middleware } from "@/middleware";
import { getSessionFromRequest } from "@/lib/auth";
import {
  isAuthRoute,
  isPrivateRoute,
  resolvePostAuthRedirect,
  resolvePrivateRedirect,
} from "@/features/auth/routes";

const userFindUniqueMock = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const userCreateMock = prisma.user.create as unknown as ReturnType<typeof vi.fn>;
const getSessionFromRequestMock =
  getSessionFromRequest as unknown as ReturnType<typeof vi.fn>;

const jsonReq = (payload: unknown) =>
  new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

const pageReq = (path: string) => new NextRequest(`http://localhost${path}`);

describe("auth login/register integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionFromRequestMock.mockResolvedValue(null);
  });

  it("allows unauthenticated users to access /login and /register", async () => {
    const loginResponse = await middleware(pageReq("/login"));
    const registerResponse = await middleware(pageReq("/register"));

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get("location")).toBeNull();
    expect(registerResponse.status).toBe(200);
    expect(registerResponse.headers.get("location")).toBeNull();
    expect(getSessionFromRequestMock).not.toHaveBeenCalled();
  });

  it("blocks unauthenticated users from /app routes and allows authenticated users", async () => {
    const blockedResponse = await middleware(pageReq("/app/ledger"));

    expect(blockedResponse.status).toBe(307);
    expect(blockedResponse.headers.get("location")).toBe(
      "http://localhost/login"
    );

    getSessionFromRequestMock.mockResolvedValueOnce({ userId: "u1" });
    const allowedResponse = await middleware(pageReq("/app/ledger"));

    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.headers.get("location")).toBeNull();
  });

  it("redirects authenticated users away from auth routes", () => {
    expect(isAuthRoute("/login")).toBe(true);
    expect(isAuthRoute("/register")).toBe(true);
    expect(resolvePostAuthRedirect(null)).toBe("/app");
    expect(resolvePostAuthRedirect("/login")).toBe("/app");
    expect(resolvePostAuthRedirect("/register")).toBe("/app");
    expect(resolvePostAuthRedirect("/app")).toBe("/app");
    expect(resolvePostAuthRedirect("/app/ledger")).toBe("/app/ledger");
  });

  it("builds private-route redirect with next parameter", () => {
    expect(isPrivateRoute("/app")).toBe(true);
    expect(resolvePrivateRedirect("/app")).toBe("/login?next=%2Fapp");
    expect(resolvePrivateRedirect("/app/ledger")).toBe(
      "/login?next=%2Fapp%2Fledger"
    );
    expect(resolvePrivateRedirect("/login")).toBeNull();
  });

  it("rejects duplicate normalized email registrations", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "u1" } as never);

    const response = await registerPOST(
      jsonReq({
        fullName: "New User",
        email: " Existing@LushLedger.com ",
        password: "ValidPass1!",
        acceptedTerms: true,
      })
    );
    const payload = await response.json();

    expect(userFindUniqueMock).toHaveBeenCalledWith({
      where: { email: "existing@lushledger.com" },
    });
    expect(response.status).toBe(409);
    expect(payload.error).toBe("Email already exists.");
  });

  it("creates session on successful registration with normalized email", async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: "u2", email: "new@lushledger.com" } as never);

    const response = await registerPOST(
      jsonReq({
        fullName: "New User",
        email: " New@LushLedger.com ",
        password: "ValidPass1!",
        acceptedTerms: true,
      })
    );

    expect(response.status).toBe(200);
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@lushledger.com",
        }),
      })
    );
  });
});
