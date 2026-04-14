import { describe, expect, it } from "vitest";
import { validateLoginForm } from "@/features/auth/login-form-validation";

describe("auth login page integration", () => {
  it("returns required errors for empty email/password", () => {
    const errors = validateLoginForm({
      email: "",
      password: "",
      remember: false,
    });

    expect(errors).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("returns email format error for malformed email", () => {
    const errors = validateLoginForm({
      email: "not-an-email",
      password: "ValidPass1!",
      remember: false,
    });

    expect(errors.email).toBe("Email format is invalid.");
    expect(errors.password).toBeUndefined();
  });

  it("passes validation for valid credentials payload", () => {
    const errors = validateLoginForm({
      email: "user@lushledger.com",
      password: "ValidPass1!",
      remember: true,
    });

    expect(errors).toEqual({});
  });
});
