"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Checkbox, Text } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { validateLoginForm } from "@/features/auth/login-form-validation";

const heroImage =
  "https://www.figma.com/api/mcp/asset/11fd5c6c-d5a1-45e3-b3c9-c49f24eda584";

function AtIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-[#89a9ba]" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 3.5a6.5 6.5 0 1 0 4.9 10.77.75.75 0 1 0-1.12-.99A5 5 0 1 1 15 10v.5a1.5 1.5 0 1 1-3 0V10a2.5 2.5 0 1 0-2.5 2.5c.62 0 1.2-.23 1.65-.62A3 3 0 0 0 16.5 10V9.9A6.5 6.5 0 0 0 10 3.5Zm-2.5 6.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
      />
    </svg>
  );
}

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

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  const { login, isLoggingIn } = useAuth();

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      setError(null);
      try {
        await login(values);
      } catch (mutationError) {
        setError(mutationError instanceof Error ? mutationError.message : "Login failed.");
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#f4faff] text-[#1b3641]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
        <section className="relative hidden overflow-hidden bg-[#e7f6ff] lg:flex">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt="Decorative abstract background"
              fill
              priority
              className="object-cover opacity-80 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-[linear-gradient(54deg,rgba(244,250,255,0.98)_0%,rgba(244,250,255,0.55)_45%,rgba(231,246,255,0.86)_100%)]" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-14 xl:p-20">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#006f1d] text-sm font-bold text-white">L</div>
                <p className="text-4xl font-extrabold text-[#1b3641]">
                  Lush Ledger
                </p>
              </div>
              <div className="max-w-[560px] space-y-6">
                <h1 className="text-6xl font-bold leading-[1.06] text-[#1b3641]">
                  A Masterclass in <span className="text-[#006f1d]">Wealth</span> Stewardship.
                </h1>
                <p className="text-2xl leading-[1.6] text-[#49636f]">
                  Welcome to your fiscal atelier-a curated space where data meets design, and your financial growth is treated with the precision of high art.
                </p>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-8 border-l border-[#006f1d]/25 pl-8">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#49636f]">
                  Portfolio Zenith
                </p>
                <p className="mt-2 text-5xl text-[#006f1d]">
                  1.240.500.000
                </p>
                <p className="mt-1 text-3xl text-[#006f1d]">
                  VND
                </p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-[#49636f]">
                  Growth Quarterly
                </p>
                <p className="mt-2 text-5xl text-[#1b3641]">
                  +12.4%
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-10 right-[-60px] z-20 flex items-center gap-4 rounded-full border border-white/30 bg-white/70 px-8 py-4 shadow-[0_32px_64px_-12px_rgba(27,54,65,0.18)] backdrop-blur-md">
            <div className="flex -space-x-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#d4ecf9] text-[11px] font-bold text-[#1b3641]">S</div>
              <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#cbe7f6] text-[11px] font-bold text-[#1b3641]">E</div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.15em] text-[#49636f]">
                Security Standard
              </p>
              <p className="text-[#1b3641]">
                End-to-End Encryption Active
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="w-full max-w-[448px]">
            <div className="space-y-2">
              <h2 className="text-5xl font-extrabold text-[#1b3641]">
                Welcome Back to the Atelier
              </h2>
              <p className="text-2xl text-[#49636f]">Secure Login</p>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              method="post"
              data-client-ready={isClientReady ? "true" : "false"}
              className="mt-10 space-y-8"
            >
              <div>
                <Text
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  isRequired
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="name@atelier.com"
                  endAdornment={<AtIcon />}
                  error={formik.touched.email ? formik.errors.email : undefined}
                  className="px-6 py-4 text-base"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-end px-1">
                  <Link href="#" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#006f1d] hover:text-[#04571b]">
                    Forgot Password?
                  </Link>
                </div>
                <Text
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
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
                  className="px-6 py-4 text-base"
                />
              </div>

              <Checkbox
                checked={formik.values.remember}
                onCheckedChange={(nextValue) => formik.setFieldValue("remember", nextValue)}
                className="px-1"
                label={<span className="text-sm font-medium text-[#49636f]">Remember this session</span>}
              />

            {error ? (
              <div className="rounded-xl border border-[#f5c8bf] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">
                  <p className="text-[#a73b21]">{error}</p>
              </div>
            ) : null}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(170deg,#006f1d_0%,#006118_100%)] px-6 py-5 font-[var(--font-manrope)] text-xl font-bold text-[#eaffe2] shadow-[0_32px_64px_-12px_rgba(27,54,65,0.15)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingIn ? "Signing In..." : "Sign In"}
                  <span aria-hidden="true">→</span>
                </button>
            </form>

            <p className="pb-10 pt-8 text-center text-xl text-[#49636f]">
              <span className="text-xl text-[#49636f]">Don&apos;t have an account? </span>
              <Link href="/register" className="font-semibold text-[#006f1d] hover:text-[#04571b]">
                Sign Up
              </Link>
            </p>

            <div className="flex items-center justify-between border-t border-[#e7f6ff] pt-8 text-[10px] uppercase tracking-[0.2em] text-[#9bb6c4]">
              <span>© 2024 Lush Ledger</span>
              <Link href="#" className="hover:text-[#6f8d9e]">
                Privacy Policy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
