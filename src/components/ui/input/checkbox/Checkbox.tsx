import * as React from "react";
import { Typography } from "@/components/ui/Typography";

export type CheckboxProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
};

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, label, isRequired = false, error, helperText, className = "", disabled = false, type = "button", ...props }, ref) => {
    const helperId = React.useId();

    return (
      <div className="space-y-[var(--spacing-2)]">
        <label
          className={[
            "inline-flex items-center gap-[var(--spacing-3)]",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            className,
          ].join(" ")}
        >
          <button
            ref={ref}
            type={type}
            role="checkbox"
            aria-checked={checked}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? helperId : undefined}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                onCheckedChange(!checked);
              }
            }}
            className={[
              "grid h-5 w-5 place-items-center rounded-[var(--radius-sm)] transition-colors",
              "focus-visible:outline-[var(--input-focus-border)]",
              error
                ? "border border-[color:rgba(167,59,33,0.6)] bg-[color:rgba(253,121,90,0.1)] text-[var(--color-error)]"
                : checked
                  ? "border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "border-2 border-[var(--color-outline-variant)] bg-transparent text-transparent hover:border-[var(--color-primary)]",
            ].join(" ")}
            {...props}
          >
            {checked ? (
              <svg
                viewBox="0 0 16 16"
                className="h-[14px] w-[14px]"
                aria-hidden="true"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>

          {label ? (
            <Typography
              as="span"
              variant="body"
              className={[
                "inline text-sm font-bold",
                error ? "text-[var(--color-error)]" : "text-[var(--color-on-surface)]",
              ].join(" ")}
            >
              {label}
              {isRequired ? <span className="ml-1 text-[var(--color-error)]">*</span> : null}
            </Typography>
          ) : null}
        </label>

        <div>
          {error ? (
            <Typography id={helperId} variant="formHelper" color="error" className="normal-case tracking-normal text-[var(--color-error)]">
              {error}
            </Typography>
          ) : helperText ? (
            <Typography id={helperId} variant="formHelper" color="secondary" className="normal-case tracking-normal text-[var(--color-on-surface-variant)]">
              {helperText}
            </Typography>
          ) : null}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
