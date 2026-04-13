import { describe, expect, it } from "vitest";
import { validateRegisterForm } from "@/features/auth/register-form-validation";

describe("auth register page integration", () => {
  it("returns errors for full name, email, password policy, and terms", () => {
    const errors = validateRegisterForm({
      fullName: "A",
      email: "bad-email",
      password: "weakpass",
      confirmPassword: "weakpass",
      acceptedTerms: false,
    });

    expect(errors.fullName).toBe("Full name is required.");
    expect(errors.email).toBe("Email format is invalid.");
    expect(errors.password).toContain("uppercase letter");
    expect(errors.password).toContain("number");
    expect(errors.password).toContain("special character");
    expect(errors.acceptedTerms).toBe("You must accept terms.");
  });

  it("requires matching confirm password", () => {
    const errors = validateRegisterForm({
      fullName: "New User",
      email: "new@lushledger.com",
      password: "ValidPass1!",
      confirmPassword: "DifferentPass1!",
      acceptedTerms: true,
    });

    expect(errors.confirmPassword).toBe("Passwords do not match.");
  });

  it("passes validation for a complete secure registration payload", () => {
    const errors = validateRegisterForm({
      fullName: "New User",
      email: "new@lushledger.com",
      password: "ValidPass1!",
      confirmPassword: "ValidPass1!",
      acceptedTerms: true,
    });

    expect(errors).toEqual({});
  });
});
