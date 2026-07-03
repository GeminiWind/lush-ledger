"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Button, Checkbox, Text } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  AuthRequestError,
} from "@/features/auth/services/auth-client";
import { validateRegisterForm } from "@/features/auth/register-form-validation";

const visualTextureImage = "/images/auth/register-visual-texture.png";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#89a9ba]" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.5 4.56 2.44 5.62l3.02 3.02A11.5 11.5 0 0 0 1.6 12a11.7 11.7 0 0 0 10.4 6 11.1 11.1 0 0 0 4.43-.92l2.95 2.95 1.06-1.06L3.5 4.56Zm8.5 11.94a4.5 4.5 0 0 1-4.5-4.5c0-.5.08-.98.23-1.42l5.69 5.69c-.44.15-.92.23-1.42.23Zm9.4-4.5a11.68 11.68 0 0 0-4.06-3.7l-1.2 1.2A10.18 10.18 0 0 1 19.7 12a10.08 10.08 0 0 1-2.25 2.7l1.08 1.08A11.6 11.6 0 0 0 21.4 12ZM12 7.5a4.5 4.5 0 0 0-2.68.88l1.15 1.15A2.99 2.99 0 0 1 15 12c0 .45-.1.88-.28 1.26l1.14 1.14c.4-.72.64-1.54.64-2.4A4.5 4.5 0 0 0 12 7.5Z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#89a9ba]" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5c5.5 0 9.5 4.58 10.4 6-.9 1.42-4.9 6-10.4 6S2.5 12.42 1.6 11C2.5 9.58 6.5 5 12 5Zm0 2c-3.58 0-6.56 2.64-8.11 4 1.55 1.36 4.53 4 8.11 4s6.56-2.64 8.11-4c-1.55-1.36-4.53-4-8.11-4Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const { register, isRegistering } = useAuth();

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    validate: validateRegisterForm,
    onSubmit: async (values) => {
      setError(null);
      try {
        await register({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          acceptedTerms: values.acceptedTerms,
        });
      } catch (mutationError) {
        if (mutationError instanceof AuthRequestError) {
          if (mutationError.fieldErrors) {
            formik.setErrors(mutationError.fieldErrors);
          }
          setError(mutationError.message);
          return;
        }

        setError(mutationError instanceof Error ? mutationError.message : "Registration failed.");
      }
    },
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faff] p-6 text-[#1b3641] lg:p-12">
      <div className="absolute right-[-8%] top-[-15%] -z-10 h-[36rem] w-[36rem] rounded-full bg-[#e7f6ff] blur-[120px]" />
      <div className="absolute bottom-[-18%] left-[-8%] -z-10 h-[28rem] w-[28rem] rounded-full bg-[#91f78e]/20 blur-[120px]" />

      <div className="grid w-full max-w-[1100px] overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_64px_-12px_rgba(27,54,65,0.1)] md:grid-cols-2">
        <section className="relative hidden flex-col justify-between bg-[#e7f6ff] p-10 md:flex lg:p-14">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#006f1d] text-sm font-bold text-white">L</div>
              <p className="text-2xl font-extrabold text-[#1b3641]">Lush Ledger</p>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xs text-4xl font-extrabold text-[#1b3641] lg:text-5xl">
                Begin Your Fiscal Journey
              </h1>
              <p className="max-w-sm text-base text-[#49636f] lg:text-lg">
                Step into a curated environment where wealth management meets editorial elegance. Your private atelier for
                financial growth awaits.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-3 h-px w-12 bg-[#9bb6c4]/40" />
              <p className="text-xs text-[#49636f]">
                Crafted for the
                <br />
                Discerning Investor
              </p>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#d4ecf9]">
              <Image src={visualTextureImage} alt="Abstract financial growth representation" fill className="object-cover opacity-70 mix-blend-multiply" />
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#1b3641]">Create Your Atelier Account</h2>
            <p className="mt-2 text-[#49636f]">Enter your details to register your private vault.</p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            method="post"
            data-client-ready={isClientReady ? "true" : "false"}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Text
                id="fullName"
                name="fullName"
                type="text"
                label="Full Name"
                isRequired
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Eleanor Vance"
                error={formik.touched.fullName ? formik.errors.fullName : undefined}
                className="px-5 py-4"
              />
            </div>

            <div className="space-y-2">
              <Text
                id="email"
                name="email"
                type="email"
                label="Email Address"
                isRequired
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="atelier@lushledger.com"
                error={formik.touched.email ? formik.errors.email : undefined}
                className="px-5 py-4"
              />
            </div>

            <div className="space-y-2">
              <Text
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Secure Password"
                  isRequired
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••••••"
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  }
                  error={formik.touched.password ? formik.errors.password : undefined}
                  className="px-5 py-4"
              />
              <p className="ml-1 text-[#647e8c]">
                Use 8-72 characters with uppercase, lowercase, number, and symbol.
              </p>
            </div>

            <div className="space-y-2">
              <Text
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  isRequired
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••••••"
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="flex items-center"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon hidden={!showConfirmPassword} />
                    </button>
                  }
                  error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
                  className="px-5 py-4"
              />
            </div>

            <Checkbox
              checked={formik.values.acceptedTerms}
              onCheckedChange={(nextValue) => formik.setFieldValue("acceptedTerms", nextValue)}
              onBlur={() => formik.setFieldTouched("acceptedTerms", true)}
              className="items-start pt-1 text-sm text-[#49636f]"
              aria-label="Accept terms"
              isRequired
              error={formik.touched.acceptedTerms ? formik.errors.acceptedTerms : undefined}
              label={
                <span className="text-sm text-[#49636f]">
                  I agree to the{" "}
                  <Link href="#" className="font-medium text-[#006f1d] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="font-medium text-[#006f1d] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              }
            />

            {error ? (
              <div className="rounded-xl border border-[#f5c8bf] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">
                <p className="text-[#a73b21]">{error}</p>
              </div>
            ) : null}

              <Button
                type="submit"
                disabled={isRegistering}
                variant="primary"
                size="extralarge"
                className="w-full text-lg shadow-[0_10px_28px_-8px_rgba(46,125,50,0.48)]"
              >
                <span className="font-[var(--font-manrope)] text-lg font-bold text-inherit">
                  {isRegistering ? "Creating Account..." : "Join the Atelier"}
                </span>
                <span aria-hidden="true">→</span>
              </Button>
          </form>

          <p className="mt-8 text-center text-[#49636f] md:text-left">
            Already have an account?
            <Link href="/login" className="ml-1 font-semibold text-[#006f1d] hover:underline">
              Sign In
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-5 border-t border-[#9bb6c4]/20 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#49636f]/80">
            <div className="flex items-center gap-1.5">
              <span>LOCKED</span>
              <span>AES-256</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>VERIFIED</span>
              <span>GDPR</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
