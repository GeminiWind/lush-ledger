import * as React from "react";

export type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const trackBaseClasses = [
  "relative inline-flex h-[var(--spacing-6)] w-[calc(var(--spacing-10)+var(--spacing-1))] items-center",
  "rounded-full",
  "transition-colors duration-200 ease-[var(--easing-standard)]",
  "focus-visible:outline-[var(--input-focus-border)]",
  "disabled:cursor-not-allowed disabled:opacity-[var(--opacity-glass)]",
].join(" ");

const thumbBaseClasses = [
  "pointer-events-none inline-block",
  "h-[calc(var(--spacing-4)+var(--spacing-1))] w-[calc(var(--spacing-4)+var(--spacing-1))] rounded-full",
  "bg-[var(--color-surface-container-lowest)]",
  "shadow-[var(--shadow-ambient)]",
  "transition-transform duration-200 ease-[var(--easing-standard)]",
].join(" ");

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className = "", disabled = false, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onCheckedChange(!checked);
          }
        }}
        className={[
          trackBaseClasses,
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]",
          className,
        ].join(" ")}
        {...props}
      >
        <span
          className={[
            thumbBaseClasses,
            checked
              ? "translate-x-[calc(var(--spacing-6)-var(--spacing-1)/2)]"
              : "translate-x-[calc(var(--spacing-1)/2)]",
          ].join(" ")}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
