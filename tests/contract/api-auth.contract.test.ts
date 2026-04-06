import { beforeEach, describe, expect, it, vi } from "vitest";
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
  verifyPassword: vi.fn(),
  signToken: vi.fn(),
  setSessionCookie: vi.fn(),
  hashPassword: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  getAuthBackoffKey: vi.fn(),
  getRemainingBackoffMs: vi.fn(),
  registerBackoffFailure: vi.fn(),
  clearBackoff: vi.fn(),
}));

import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import {
  clearBackoff,
  getAuthBackoffKey,
  getRemainingBackoffMs,
  registerBackoffFailure,
} from "@/lib/rate-limit";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";

const mockedVerifyPassword = vi.mocked(verifyPassword);
const mockedSignToken = vi.mocked(signToken);
const mockedSetSessionCookie = vi.mocked(setSessionCookie);
const mockedHashPassword = vi.mocked(hashPassword);
const mockedClearSessionCookie = vi.mocked(clearSessionCookie);
const mockedBackoffKey = vi.mocked(getAuthBackoffKey);
const mockedRemaining = vi.mocked(getRemainingBackoffMs);
const mockedRegisterFailure = vi.mocked(registerBackoffFailure);
const mockedClearBackoff = vi.mocked(clearBackoff);
const userFindUniqueMock = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const userCreateMock = prisma.user.create as unknown as ReturnType<typeof vi.fn>;

const jsonReq = (url: string, payload: unknown) =>
  new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

describe("Auth API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedBackoffKey.mockReturnValue("bk");
    mockedRemaining.mockReturnValue(0);
    mockedRegisterFailure.mockReturnValue(1200);
    mockedSignToken.mockResolvedValue("token");
    mockedSetSessionCookie.mockResolvedValue(undefined);
    mockedHashPassword.mockResolvedValue("hash");
    mockedClearSessionCookie.mockResolvedValue(undefined);
  });

  it("POST /api/auth/login returns 429 when backoff active", async () => {
    mockedRemaining.mockReturnValue(3000);

    const response = await loginPOST(jsonReq("http://localhost/api/auth/login", { email: "a@b.com", password: "pw" }));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toContain("Too many attempts");
    expect(payload.retryAfterMs).toBe(3000);
  });

  it("POST /api/auth/login returns 400 for missing credentials", async () => {
    const response = await loginPOST(jsonReq("http://localhost/api/auth/login", { email: "", password: "" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Email and password are required");
    expect(payload.retryAfterMs).toBe(1200);
  });

  it("POST /api/auth/login returns 401 for invalid credentials", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      passwordHash: "hash",
    } as never);
    mockedVerifyPassword.mockResolvedValue(false);

    const response = await loginPOST(
      jsonReq("http://localhost/api/auth/login", { email: "user@example.com", password: "wrong" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain("Invalid credentials");
  });

  it("POST /api/auth/login returns ok and sets session cookie", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      passwordHash: "hash",
    } as never);
    mockedVerifyPassword.mockResolvedValue(true);

    const response = await loginPOST(
      jsonReq("http://localhost/api/auth/login", { email: "user@example.com", password: "goodpw", remember: true }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(mockedClearBackoff).toHaveBeenCalledWith("bk");
    expect(mockedSignToken).toHaveBeenCalled();
    expect(mockedSetSessionCookie).toHaveBeenCalled();
  });

  it("POST /api/auth/register returns 400 for invalid input", async () => {
    const response = await registerPOST(
      jsonReq("http://localhost/api/auth/register", { fullName: "A", email: "", password: "123", acceptedTerms: false }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Full name, email, password");
  });

  it("POST /api/auth/register returns 409 when email exists", async () => {
    userFindUniqueMock.mockResolvedValue({ id: "u1" } as never);

    const response = await registerPOST(
      jsonReq("http://localhost/api/auth/register", {
        fullName: "User Name",
        email: "user@example.com",
        password: "12345678",
        acceptedTerms: true,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toBe("Email already exists.");
  });

  it("POST /api/auth/register returns ok and sets session cookie", async () => {
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({ id: "u2", email: "new@example.com" } as never);

    const response = await registerPOST(
      jsonReq("http://localhost/api/auth/register", {
        fullName: "New User",
        email: "new@example.com",
        password: "12345678",
        acceptedTerms: true,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(mockedHashPassword).toHaveBeenCalledWith("12345678");
    expect(mockedSetSessionCookie).toHaveBeenCalled();
  });

  it("POST /api/auth/logout clears session and redirects", async () => {
    const response = await logoutPOST(new NextRequest("http://localhost/api/auth/logout", { method: "POST" }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(mockedClearSessionCookie).toHaveBeenCalled();
  });
});
