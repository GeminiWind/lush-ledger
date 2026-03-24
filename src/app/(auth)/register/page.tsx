"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";

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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    validate: (values) => {
      const errors: {
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        acceptedTerms?: string;
      } = {};

      if (!values.fullName.trim() || values.fullName.trim().length < 2) {
        errors.fullName = "Full name is required.";
      }
      if (!values.email.trim()) {
        errors.email = "Email is required.";
      }
      if (!values.password || values.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }
      if (!values.confirmPassword || values.confirmPassword.length < 8) {
        errors.confirmPassword = "Confirm password is required.";
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
      if (!values.acceptedTerms) {
        errors.acceptedTerms = "You must accept terms.";
      }

      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          acceptedTerms: values.acceptedTerms,
        }),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Registration failed.");
        return;
      }

      router.push("/app");
      router.refresh();
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
              <p className="font-[var(--font-manrope)] text-2xl font-extrabold tracking-[-0.02em]">Lush Ledger</p>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xs font-[var(--font-manrope)] text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1b3641] lg:text-5xl">
                Begin Your Fiscal Journey
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-[#49636f] lg:text-lg">
                Step into a curated environment where wealth management meets editorial elegance. Your private atelier for
                financial growth awaits.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-3 h-px w-12 bg-[#9bb6c4]/40" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#49636f]">
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
            <h2 className="font-[var(--font-manrope)] text-3xl font-bold text-[#1b3641]">Create Your Atelier Account</h2>
            <p className="mt-2 text-[#49636f]">Enter your details to register your private vault.</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                Full Name <span className="text-[#a73b21]">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Eleanor Vance"
                className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 text-[#1b3641] placeholder:text-[#9bb6c4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/35"
              />
              {formik.touched.fullName && formik.errors.fullName ? <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.fullName}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                Email Address <span className="text-[#a73b21]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="atelier@lushledger.com"
                className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 text-[#1b3641] placeholder:text-[#9bb6c4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/35"
              />
              {formik.touched.email && formik.errors.email ? <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                Secure Password <span className="text-[#a73b21]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 pr-12 text-[#1b3641] placeholder:text-[#9bb6c4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-4 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.password}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                Confirm Password <span className="text-[#a73b21]">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 pr-12 text-[#1b3641] placeholder:text-[#9bb6c4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/35"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute inset-y-0 right-4 flex items-center"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showConfirmPassword} />
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.confirmPassword}</p> : null}
            </div>

            <label className="flex items-start gap-3 pt-1 text-sm text-[#49636f]">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                checked={formik.values.acceptedTerms}
                onChange={(event) => formik.setFieldValue("acceptedTerms", event.target.checked)}
                onBlur={() => formik.setFieldTouched("acceptedTerms", true)}
                className="mt-0.5 h-5 w-5 rounded border-none bg-[#e7f6ff] accent-[#006f1d]"
              />
              <span>
                I agree to the{" "}
                <Link href="#" className="font-medium text-[#006f1d] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-medium text-[#006f1d] hover:underline">
                  Privacy Policy
                </Link>
                . <span className="text-[#a73b21]">*</span>
              </span>
            </label>
            {formik.touched.acceptedTerms && formik.errors.acceptedTerms ? (
              <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.acceptedTerms}</p>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-[#f5c8bf] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">{error}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] px-6 py-4 font-[var(--font-manrope)] text-lg font-bold text-[#eaffe2] shadow-[0_10px_28px_-8px_rgba(46,125,50,0.48)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Join the Atelier"}
              <span aria-hidden="true">→</span>
            </button>
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
