import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility to merge tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Lush Ledger Button Component Strategy
 * 
 * Derived from the "Fiscal Atelier" design system.
 * Employs high-fidelity interactions, organic layering, and 
 * editorial precision.
 */

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--btn-radius)] [font-family:var(--font-body)] font-bold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:[--tw-ring-color:var(--input-focus-border)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:grayscale',
  {
    variants: {
      variant: {
        primary: 'bg-[image:var(--gradient-primary)] text-[var(--color-on-primary)] hover:brightness-105 shadow-[var(--shadow-ambient)]',
        secondary: 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] hover:bg-[var(--color-surface-container-highest)]',
        outline: 'border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]',
        ghost: 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]',
        error: 'bg-[var(--color-error)] text-[var(--color-on-primary)] hover:brightness-95 shadow-[var(--shadow-ambient)]',
        success: 'bg-[var(--color-success)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dim)] shadow-[var(--shadow-ambient)]',
        tertiary: 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-secondary-container)]',
      },
      size: {
        small: 'text-[length:var(--font-label-sm)] px-[var(--spacing-3)] py-[var(--spacing-1)] gap-[var(--spacing-1)]',
        medium: 'text-[length:var(--font-label-md)] px-[var(--btn-padding-x)] py-[var(--btn-padding-y)] gap-[var(--spacing-2)]',
        large: 'text-[length:var(--font-body-md)] px-[var(--spacing-6)] py-[var(--spacing-3)] gap-[var(--spacing-2)]',
        extralarge: 'text-[length:var(--font-body-md)] px-[calc(var(--spacing-6)*2)] py-[var(--spacing-4)] gap-[var(--spacing-3)]',
      },
      isIconOnly: {
        true: 'h-[calc(var(--spacing-8)+var(--spacing-1))] w-[calc(var(--spacing-8)+var(--spacing-1))] p-0',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
      isIconOnly: false,
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps["variant"]>;
export type ButtonSize = NonNullable<ButtonVariantProps["size"]>;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    asChild?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isIconOnly, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, isIconOnly, className }))}
        {...props}
      >
        {!isIconOnly && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!isIconOnly && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
