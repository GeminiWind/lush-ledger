import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive";
export type ButtonSize = "xs" | "xm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClasses = [
  "inline-flex items-center justify-center gap-[var(--spacing-2)]",
  "rounded-[var(--btn-radius)]",
  "[font-family:var(--font-body)] text-[length:var(--font-body-md)] font-normal leading-relaxed",
  "transition-all duration-200 ease-[var(--easing-standard)]",
  "outline-none focus-visible:[--tw-ring-color:var(--input-focus-border)] focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-glass)]",
].join(" ");

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-[var(--spacing-3)] py-[var(--spacing-1)]",
  xm: "px-[var(--btn-padding-x)] py-[var(--spacing-1)]",
  md: "px-[var(--btn-padding-x)] py-[var(--btn-padding-y)]",
  lg: "px-[calc(var(--btn-padding-x)+var(--spacing-2))] py-[calc(var(--btn-padding-y)+var(--spacing-1))]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-ambient)] hover:bg-[var(--color-primary-dim)] active:translate-y-px",
  secondary:
    "bg-[var(--color-secondary-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]",
  destructive:
    "bg-[var(--color-error)] text-[var(--color-on-primary)] shadow-[var(--shadow-ambient)] hover:brightness-95 active:translate-y-px",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
