import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

export const typographyVariants = cva("antialiased transition-colors duration-200", {
  variants: {
    variant: {
      hero: "[font-family:var(--font-display)] text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]",
      pageTitle: "[font-family:var(--font-display)] text-2xl md:text-3xl font-bold tracking-tight leading-tight",
      sectionTitle: "[font-family:var(--font-display)] text-lg md:text-xl font-semibold leading-snug",
      cardTitle: "[font-family:var(--font-display)] text-base font-semibold leading-normal",
      dataDisplay:
        "[font-family:var(--font-display)] text-2xl md:text-3xl font-bold tabular-nums tracking-tight",
      body: "[font-family:var(--font-body)] text-[length:var(--font-body-md)] font-normal leading-relaxed",
      bodySm: "[font-family:var(--font-body)] text-[length:var(--font-label-md)] font-normal leading-normal",
      label: "[font-family:var(--font-body)] text-[length:var(--font-label-md)] font-medium tracking-wide",
      navLabel: "[font-family:var(--font-body)] text-[length:var(--font-label-md)] font-semibold tracking-tight",
      button: "[font-family:var(--font-body)] text-[length:var(--font-label-md)] font-bold tracking-tight",
      formHelper: "[font-family:var(--font-body)] text-[length:var(--font-label-sm)] font-normal",
      caption: "[font-family:var(--font-body)] text-[10px] font-medium tracking-widest",
    },
    color: {
      primary: "text-[var(--color-on-surface)]",
      secondary: "text-[var(--color-on-surface-variant)]",
      inverse: "text-[var(--color-surface-container-lowest)]",
      accent: "text-[var(--color-primary)]",
      error: "text-[var(--color-error)]",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "primary",
  },
});

export type TypographyVariantProps = VariantProps<typeof typographyVariants>;

export type TypographyVariant = NonNullable<TypographyVariantProps["variant"]>;

export type TypographyProps<T extends React.ElementType> = {
  as?: T;
  variant?: TypographyVariantProps["variant"];
  color?: TypographyVariantProps["color"];
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export const defaultElementByVariant: Record<TypographyVariant, React.ElementType> = {
  hero: "h1",
  pageTitle: "h1",
  sectionTitle: "h2",
  cardTitle: "h3",
  dataDisplay: "p",
  body: "p",
  bodySm: "p",
  label: "span",
  navLabel: "span",
  button: "span",
  formHelper: "span",
  caption: "span",
};

export function Typography<T extends React.ElementType = "p">({
  as,
  variant = "body",
  color = "primary",
  className = "",
  children,
  ...props
}: TypographyProps<T>) {
  const resolvedVariant = (variant ?? "body") as TypographyVariant;
  const Component = (as ?? defaultElementByVariant[resolvedVariant]) as React.ElementType;

  return (
    <Component className={typographyVariants({ variant: resolvedVariant, color, className })} {...props}>
      {children}
    </Component>
  );
}
