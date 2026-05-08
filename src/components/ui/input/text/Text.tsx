import * as React from "react";
import { Typography } from "@/components/ui/Typography";

export type TextProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
  endAdornment?: React.ReactNode;
};

export const Text = React.forwardRef<HTMLInputElement, TextProps>(
  ({ id, label, isRequired = false, error, helperText, endAdornment, className = "", disabled = false, ...props }, ref) => {
    const inputId = id;

    return (
      <div className="space-y-[var(--spacing-2)]">
        {label ? (
          <label htmlFor={inputId} className="block">
            <Typography
              variant="bodySm"
              className={[
                "font-normal tracking-normal",
                error ? "text-[var(--color-error)]" : "text-[var(--color-on-surface-variant)]",
              ].join(" ")}
            >
              {label}
              {isRequired ? <span className="ml-1 text-[var(--color-error)]">*</span> : null}
            </Typography>
          </label>
        ) : null}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={[
              "w-full rounded-[var(--input-radius)] bg-[var(--input-bg)] px-[var(--spacing-4)] py-[var(--spacing-4)]",
              "text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)]",
              "outline-none ring-2 ring-transparent transition focus:[--tw-ring-color:var(--input-focus-border)]",
              endAdornment ? "pr-12" : "",
              disabled ? "cursor-not-allowed opacity-[var(--opacity-glass)]" : "",
              error
                ? "border border-[color:rgba(167,59,33,0.3)] bg-[color:rgba(253,121,90,0.1)] text-[var(--color-error)] ring-0"
                : "border-none",
              className,
            ].join(" ")}
            {...props}
          />
          {endAdornment ? (
            <div
              className={[
                "absolute inset-y-0 right-[var(--spacing-4)] flex items-center",
                "pointer-events-auto",
                error ? "text-[var(--color-error)]" : "text-[var(--color-on-surface-variant)]",
              ].join(" ")}
            >
              {endAdornment}
            </div>
          ) : null}
        </div>

        {error ? (
          <Typography variant="formHelper" color="error" className="normal-case tracking-normal text-[var(--color-error)]">
            {error}
          </Typography>
        ) : helperText ? (
          <Typography variant="formHelper" color="secondary" className="normal-case tracking-normal text-[var(--color-on-surface-variant)]">
            {helperText}
          </Typography>
        ) : null}
      </div>
    );
  }
);

Text.displayName = "Text";
